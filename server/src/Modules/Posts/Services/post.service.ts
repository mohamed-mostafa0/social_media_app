import type { Request, Response } from "express";
import { followStatusEnum, type IComment, type IPost, type IRequest } from "../../../Common/index.js";
import { CommentRepository, FollowRepository, PostRepository, UserRepository } from "../../../DB/Repositories/index.js";
import { BadRequestException, deleteImageFromCloudinary, deleteImagesOnCloudinary, NotFoundException, pagination, successResponse, UnauthorizedException, uploadImageOnCloudinary, uploadImagesOnCloudinary } from "../../../Utils/index.js";
import { UserModel } from "../../../DB/Models/index.js";
import type { Types } from "mongoose";
import mongoose from "mongoose";




class PostService {

    private postRepo: PostRepository = new PostRepository()
    private userRepo: UserRepository = new UserRepository(UserModel)
    private followRepo: FollowRepository = new FollowRepository()
    private commentRepo: CommentRepository = new CommentRepository()


    addPost = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser
        const { describtion, allowComments, tags }: IPost = req.body
        const files = req.files as Express.Multer.File[] | undefined

        if (!describtion && (!files || files.length === 0)) throw new BadRequestException("Describtion or files is required")

        let finalTags = tags;
        if (tags && tags.length) {
            finalTags = Array.from(new Set(tags))

            const users = await this.userRepo.findDocuments({ _id: { $in: finalTags as Types.ObjectId[] } })
            if (users.length !== finalTags.length) throw new BadRequestException("Some tagged users do not exist")

            const friendships = await this.followRepo.findDocuments({
                status: followStatusEnum.ACCEPTED,
                $or: [
                    { followFromId: _id, followToId: { $in: finalTags as Types.ObjectId[] } },
                    { followToId: _id, followFromId: { $in: finalTags as Types.ObjectId[] } }
                ]
            })

            if (friendships.length !== finalTags.length) throw new BadRequestException("You can only tag friends who have accepted your friend request")
        }

        let attachments: string[] = [];
        let attachmentsPublicIds: string[] = []
        if (files?.length) {
            const filePaths = files.map(file => file.path)
            const uploadResponses = await uploadImagesOnCloudinary(filePaths, "posts")
            attachments = uploadResponses.map(response => response.secure_url)
            attachmentsPublicIds = uploadResponses.map(response => response.public_id)
        }

        const post = await this.postRepo.createDocument({
            describtion, attachments, attachmentsPublicIds, allowComments, tags: finalTags, ownerId: _id
        })
        await this.userRepo.findByIdAndUpdateDocument(_id, {
            $inc: {
                postsCount: 1
            }
        })

        return res.status(201).json(successResponse("Post added successfully", 201, post))
    }


    // listHomePosts = async (req:Request , res:Response)=>{
    //     const {page , limit} = req.query
    //     const {user:{_id}} = (req as IRequest).loggedInUser

    //     const{limit:currentLimit , skip} = pagination({limit:Number(limit) , page:Number(page)})
    //     const posts = await this.postRepo.postPagination({} , {limit:currentLimit , page:Number(page)})

    //     return res.status(200).json(successResponse("" , 200 , posts))
    // }

    deletePost = async (req: Request, res: Response) => {
        const { postId } = req.params
        const { user: { _id } } = (req as IRequest).loggedInUser

        const post = await this.postRepo.findDocumentById(postId as string)
        if (!post) throw new NotFoundException("Post not found")
        if (post.ownerId.toString() !== _id.toString()) throw new UnauthorizedException("You are not authorized to delete this post")

        await Promise.all([
            this.postRepo.findDocumentByIdAndDelete(postId as string),
            deleteImagesOnCloudinary(post.attachmentsPublicIds as string[])
        ])
        return res.status(200).json(successResponse("Post deleted successfully", 200))
    }

    addComment = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;
        const { postId } = req.params;
        const { parentCommentId, content } = req.body;
        const attachment = req.file as Express.Multer.File | undefined;


        if (!content && !attachment) {
            throw new BadRequestException("Comment content or attachments is required");
        }
        if (content && content.trim().length === 0) {
            throw new BadRequestException("Comment cannot be empty");
        }
        const post = await this.postRepo.findDocumentById(postId as string);
        if (!post) throw new NotFoundException("Post not found");
        if (!post.allowComments) {
            throw new BadRequestException("Comments are disabled for this post");
        }

        let targetParentId = parentCommentId

        if (parentCommentId) {
            const parentComment = await this.commentRepo.findDocumentById(parentCommentId);
            if (!parentComment) throw new NotFoundException("Parent comment not found");
            if (parentComment.parentCommentId) {
                targetParentId = parentComment.parentCommentId.toString()
            }
        }
        let attachmentData: { url: string; publicId: string } | undefined;
        if (attachment) {
            try {
                const attachemntResponse = await uploadImageOnCloudinary(attachment.path, "comments");
                attachmentData = { url: attachemntResponse.secure_url, publicId: attachemntResponse.public_id };
            } catch (err) {
                console.log(err);

                throw new Error("Failed to upload attachment")

            }
        }
        const session = await mongoose.startSession();
        let comment: IComment | null = null;
        try {
            await session.withTransaction(async () => {
                if (parentCommentId) {
                    const updatedParent = await this.commentRepo.findByIdAndUpdateDocument(
                        targetParentId,
                        { $inc: { repliesCount: 1 } },
                        { session }
                    );
                    if (!updatedParent) throw new NotFoundException("Parent comment not found");
                }
                comment = await this.commentRepo.createDocument({
                    content,
                    ...(attachmentData && { attachment: attachmentData }),
                    parentCommentId: parentCommentId || null,
                    postId: postId as unknown as Types.ObjectId,
                    ownerId: _id
                }, { session });
                const updatedPost = await this.postRepo.findByIdAndUpdateDocument(
                    postId as string,
                    { $inc: { commentsCount: 1 } },
                    { session }
                );
                if (!updatedPost) throw new NotFoundException("Post not found");
            });
        } catch (error) {
            if (attachmentData?.publicId) {
                await deleteImageFromCloudinary(attachmentData.publicId).catch(() => { });
            }
            throw error;
        } finally {
            await session.endSession();
        }
        return res.status(201).json(successResponse("Comment added successfully", 201, comment));
    };

    // deleteComment = async(req:Request , res:Response) =>{
    //     const {user:{_id}} = (req as IRequest).loggedInUser
    //     const {commentId} = req.params

    //     const comment = await this.commentRepo.findDocumentById(commentId as string)

    //     if(_id.toString() !== comment?.ownerId.toString()) throw new UnauthorizedException("Unauthorized, You are not the owner of the comment")

    //     const session = mongoose.startSession()
    //     try{
    //         (await session).withTransaction(async()=>{
    //             await Promise.all([
    //                 this.commentRepo.deleteManyDocuments({parentCommentId:commentId}),
    //                 this.commentRepo.findDocumentByIdAndDelete({_id:commentId })
    //             ])

    //         })
    //     }finally{
    //         (await session).endSession()
    //     }
    // }

}


export default new PostService()