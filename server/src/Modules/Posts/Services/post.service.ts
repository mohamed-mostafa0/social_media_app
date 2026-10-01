import type { Request, Response } from "express";
import { followStatusEnum, type IComment, type IPost, type IRequest } from "../../../Common/index.js";
import { CommentRepository, FollowRepository, PostRepository, UserRepository } from "../../../DB/Repositories/index.js";
import { BadRequestException, deleteImageFromCloudinary, deleteImagesOnCloudinary, NotFoundException, pagination, successResponse, UnauthorizedException, uploadImageOnCloudinary, uploadImagesOnCloudinary } from "../../../Utils/index.js";
import { UserModel } from "../../../DB/Models/index.js";
import type { Types } from "mongoose";




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

    editPost = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;
        const { postId } = req.params;
        const { describtion, removeAttachments, allowComments } = req.body;
        const files = Array.isArray(req.files)
            ? req.files
            : (req.files as Record<string, Express.Multer.File[]> | undefined)?.attachments ||
              (req.files as Record<string, Express.Multer.File[]> | undefined)?.images;

        if (!postId) throw new BadRequestException("PostId is required");

        const post = await this.postRepo.findDocumentById(postId as string);
        if (!post) throw new NotFoundException("Post not found");
        if (_id.toString() !== post.ownerId.toString()) {
            throw new UnauthorizedException("Unauthorized, you are not the owner of this post");
        }
        let toRemove: string[] = [];
        if (removeAttachments === true || removeAttachments === "true") {
            toRemove = [...(post.attachmentsPublicIds || []), ...(post.attachments || [])];
        } else if (removeAttachments) {
            if (typeof removeAttachments === "string") {
            try {
                const parsed = JSON.parse(removeAttachments);
                toRemove = Array.isArray(parsed) ? parsed : [removeAttachments];
            } catch {
                toRemove = [removeAttachments];
            }
            } else if (Array.isArray(removeAttachments)) {
            toRemove = removeAttachments;
        }
}  
        const remainingAttachments: string[] = [];
        const remainingPublicIds: string[] = [];
        const publicIdsToDelete: string[] = [];
        (post.attachments || []).forEach((url, index) => {
            const publicId = post.attachmentsPublicIds?.[index];
            const isMarkedForRemoval =
                (publicId && toRemove.includes(publicId)) || toRemove.includes(url);
            if (isMarkedForRemoval) {
                if (publicId) publicIdsToDelete.push(publicId);
            } else {
                remainingAttachments.push(url);
                if (publicId) remainingPublicIds.push(publicId);
            }
        });
        let newAttachments: string[] = [];
        let newPublicIds: string[] = [];
        if (files && files.length > 0) {
            try {
                const filePaths = files.map((file) => file.path);
                const uploadResponses = await uploadImagesOnCloudinary(filePaths, "posts");
                newAttachments = uploadResponses.map((res) => res.secure_url);
                newPublicIds = uploadResponses.map((res) => res.public_id);
            } catch (err) {
                console.error(err);
                throw new BadRequestException("Failed to upload attachments");
            }
        }
        const finalAttachments = [...remainingAttachments, ...newAttachments];
        const finalAttachmentsPublicIds = [...remainingPublicIds, ...newPublicIds];
        const finalDescribtion =
            describtion !== undefined ? describtion.trim() : post.describtion;
        if (!finalDescribtion && finalAttachments.length === 0) {
            if (newPublicIds.length > 0) {
                await deleteImagesOnCloudinary(newPublicIds).catch(() => {});
            }
            throw new BadRequestException("Post must have a description or at least one attachment");
        }
        try {
            const updatePayload: Record<string, any> = {
                attachments: finalAttachments,
                attachmentsPublicIds: finalAttachmentsPublicIds,
            };
            if (describtion !== undefined) updatePayload.describtion = finalDescribtion;
            if (allowComments !== undefined) updatePayload.allowComments = allowComments;
            const updatedPost = await this.postRepo.findByIdAndUpdateDocument(
                postId as string,
                updatePayload,
                { new: true }
            );
            if (publicIdsToDelete.length > 0) {
                await deleteImagesOnCloudinary(publicIdsToDelete).catch(() => {});
            }
            return res.status(200).json(successResponse("Post updated successfully", 200, updatedPost));
        } catch (error) {
            if (newPublicIds.length > 0) {
                await deleteImagesOnCloudinary(newPublicIds).catch(() => {});
            }
            throw error;
        }
    };


}


export default new PostService()