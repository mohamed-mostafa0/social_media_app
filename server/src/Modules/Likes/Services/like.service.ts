import type { Request, Response } from "express"
import { BaseRepository, CommentRepository, LikeRepository , PostRepository} from "../../../DB/Repositories/index.js"
import { LikeOnModelEnum, NotificationEntityTypeEnum, NotificattionTypeEnum, type IRequest } from "../../../Common/index.js"
import type { Model, Types } from "mongoose"
import { BadRequestException, NotFoundException, successResponse } from "../../../Utils/index.js"
import mongoose from "mongoose"
import { NotificationRepository } from "../../../DB/Repositories/notification.repository.js"
import { emitToUser } from "../../../Gateways/socket.gateway.js"




class LikeService {

    private likeRepo:LikeRepository = new LikeRepository()
    private postRepo:PostRepository = new PostRepository()
    private commentRepo:CommentRepository = new CommentRepository()
    private notificationRepo:NotificationRepository = new NotificationRepository()
    private repoMap:Record<LikeOnModelEnum , BaseRepository<any>> = {
        [LikeOnModelEnum.Post]:this.postRepo,
        [LikeOnModelEnum.Comment]:this.commentRepo,

    }

    toggleLike = async(req:Request , res:Response)=>{
        const {user} = (req as IRequest).loggedInUser
        const {refId} = req.params
        const {onModel} = req.body as {onModel:LikeOnModelEnum}

        const targetRepo = this.repoMap[onModel]
        if(!targetRepo) throw new BadRequestException("Invalid onModel type. Must be 'Post' or 'Comment'")
        // console.log(targetRepo);
        
        const targetDoc = await targetRepo.findDocumentById(refId as string)
        if(!targetDoc) throw new NotFoundException(`${onModel} not found`)
            // console.log(targetDoc);
            
        const existingLike = await this.likeRepo.findOneDocument({
            userId:user._id,
            onModel,
            refId
        })

        let message = ''
        let isSelfAction =user._id.toString() === targetDoc.ownerId.toString() 
        const notificationMessage = `${user.firstName} ${user.lastName} liked your ${onModel.toLocaleLowerCase()}`
        let shouldNotify = false
        const session = await mongoose.startSession()
        try{
            await session.withTransaction(async()=>{                
                if(existingLike){
                    await this.likeRepo.findDocumentByIdAndDelete(existingLike._id, { session })
                    await targetRepo.findByIdAndUpdateDocument(refId as string, {
                        $inc: { likesCount: -1 }
                    }, { session })

                    if (!isSelfAction) {
                        await this.notificationRepo.deleteManyDocuments({
                            senderId: user._id,
                            recipientId: targetDoc.ownerId,
                            type: NotificattionTypeEnum.LIKE,
                            entityId: refId as unknown as Types.ObjectId,
                        }, { session })
                    }
                    message = "Unlike successfully"
                }else{
                    await this.likeRepo.createDocument({
                        userId: user._id,
                        refId: refId as unknown as Types.ObjectId,
                        onModel
                    }, { session })

                    await targetRepo.findByIdAndUpdateDocument(refId as string, {
                        $inc: { likesCount: 1 }
                    }, { session })

                    if(!isSelfAction){
                        await this.notificationRepo.createDocument({
                            senderId: user._id,
                            recipientId: targetDoc.ownerId,
                            type: NotificattionTypeEnum.LIKE,
                            entityId: refId as unknown as Types.ObjectId,
                            entityType: onModel,
                            message: notificationMessage
                        }, { session })
                        shouldNotify = true
                    }

                    message = `${onModel} liked successfully`
                }
            })
        }finally{
            await session.endSession()
        }

        if(shouldNotify){
            emitToUser(targetDoc.ownerId.toString() ,"like",{
                message:notificationMessage,
                data:{
                    refId,
                    entityType:onModel,
                    sender:{
                        _id:user._id,
                        firstName:user.firstName,
                        lastName:user.lastName,
                        profilePicture:user.profilePicture
                    }
                }
            })
        }

        return res.status(200).json(successResponse(message , 200 ))
    }

}


export default new LikeService()