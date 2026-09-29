import type { Request, Response } from "express";
import { type IComment, type IRequest } from "../../../Common/index.js";
import { CommentRepository, FollowRepository, PostRepository, UserRepository } from "../../../DB/Repositories/index.js";
import { BadRequestException, deleteImageFromCloudinary, deleteImagesOnCloudinary, NotFoundException, pagination, successResponse, UnauthorizedException, uploadImageOnCloudinary, uploadImagesOnCloudinary } from "../../../Utils/index.js";
import type { Types } from "mongoose";
import mongoose from "mongoose";





export class CommentService {

    private postRepo: PostRepository = new PostRepository()
    private commentRepo: CommentRepository = new CommentRepository()


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
                    parentCommentId: targetParentId || null,
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

    deleteComment = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;
        const { commentId } = req.params;

        if (!commentId) throw new BadRequestException("Comment ID is required");

        const comment = await this.commentRepo.findDocumentById(commentId as string);
        if (!comment) throw new NotFoundException("Comment not found");

        const post = await this.postRepo.findDocumentById(comment.postId.toString());
        if (!post) throw new NotFoundException("Post not found");

        const isCommentOwner = comment.ownerId.toString() === _id.toString();
        const isPostOwner = post.ownerId.toString() === _id.toString();

        if (!isCommentOwner && !isPostOwner) {
            throw new UnauthorizedException("Unauthorized, You are not authorized to delete this comment");
        }

        const publicImagesId: string[] = [];
        if (comment.attachment?.publicId) {
            publicImagesId.push(comment.attachment.publicId);
        }

        let childCommentsCount = 0;
        if (!comment.parentCommentId) {
            const childComments = await this.commentRepo.findDocuments({
                parentCommentId: commentId as unknown as Types.ObjectId
            });
            childCommentsCount = childComments.length;
            childComments.forEach((c) => {
                if (c.attachment?.publicId) publicImagesId.push(c.attachment.publicId);
            });
        }

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                if (!comment.parentCommentId) {
                    await this.commentRepo.deleteManyDocuments(
                        { parentCommentId: commentId as unknown as Types.ObjectId },
                        { session }
                    );
                    await this.commentRepo.findDocumentByIdAndDelete(commentId as string, { session });

                    await this.postRepo.findByIdAndUpdateDocument(
                        comment.postId.toString(),
                        { $inc: { commentsCount: -(1 + childCommentsCount) } },
                        { session }
                    );
                } else {
                    await this.commentRepo.findDocumentByIdAndDelete(commentId as string, { session });

                    await this.commentRepo.findByIdAndUpdateDocument(
                        comment.parentCommentId.toString(),
                        { $inc: { repliesCount: -1 } },
                        { session }
                    );

                    await this.postRepo.findByIdAndUpdateDocument(
                        comment.postId.toString(),
                        { $inc: { commentsCount: -1 } },
                        { session }
                    );
                }
            });
        } finally {
            await session.endSession();
        }

        if (publicImagesId.length) {
            await deleteImagesOnCloudinary(publicImagesId).catch(() => {});
        }

        return res.status(200).json(successResponse("Comment deleted successfully", 200));
    };

    editComment = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;
        const { commentId } = req.params;
        const attachment = req.file as Express.Multer.File | undefined;
        const { content, removeAttachment } = req.body;

        if (!commentId) throw new BadRequestException("Comment ID is required");

        const comment = await this.commentRepo.findDocumentById(commentId as string);
        if (!comment) throw new NotFoundException("Comment not found");
        if (_id.toString() !== comment.ownerId.toString()) {
            throw new UnauthorizedException("Unauthorized, you are not the owner for this comment");
        }

        const post = await this.postRepo.findDocumentById(comment.postId.toString());
        if (!post) throw new NotFoundException("Post not found or has been deleted");
        if (!post.allowComments) throw new BadRequestException("Comments are disabled for this post");

        const trimmedContent = content !== undefined ? content.trim() : comment.content;
        const isRemovingAttachment = (removeAttachment === true || removeAttachment === "true") && !attachment;
        const willHaveAttachment = !!attachment || (!!comment.attachment && !isRemovingAttachment);

        if (!willHaveAttachment && (!trimmedContent || trimmedContent.length === 0)) {
            throw new BadRequestException("Comment cannot be empty (must have text content or an attachment)");
        }

        if (!attachment && !isRemovingAttachment && content !== undefined && trimmedContent === comment.content) {
            return res.status(200).json(successResponse("Comment updated successfully", 200, comment));
        }

        let attachmentData: { url: string; publicId: string } | undefined;
        if (attachment) {
            try {
                const uploadResponse = await uploadImageOnCloudinary(attachment.path, "comments");
                attachmentData = { url: uploadResponse.secure_url, publicId: uploadResponse.public_id };
            } catch (err) {
                console.log(err);
                throw new BadRequestException("Failed to upload attachment");
            }
        }

        const updateQuery: { $set?: Record<string, any>; $unset?: Record<string, any> } = {};

        if (content !== undefined) {
            updateQuery.$set = { ...updateQuery.$set, content: trimmedContent };
        }
        console.log(updateQuery);
        

        if (attachmentData) {
            updateQuery.$set = { ...updateQuery.$set, attachment: attachmentData };
        } else if (isRemovingAttachment) {
            updateQuery.$unset = { ...updateQuery.$unset, attachment: "" };
        }

        try {
            const updatedComment = await this.commentRepo.findByIdAndUpdateDocument(
                commentId as string,
                updateQuery,
                { new: true }
            );

            if (!updatedComment) throw new NotFoundException("Comment not found or has been deleted");

            if ((attachmentData || isRemovingAttachment) && comment.attachment?.publicId) {
                await deleteImageFromCloudinary(comment.attachment.publicId).catch(() => {});
            }

            return res.status(200).json(successResponse("Comment updated successfully", 200, updatedComment));
        } catch (error) {
            if (attachmentData?.publicId) {
                await deleteImageFromCloudinary(attachmentData.publicId).catch(() => {});
            }
            throw error;
        }
    };
}

export default new CommentService()