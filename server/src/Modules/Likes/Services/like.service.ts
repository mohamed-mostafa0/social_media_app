import type { Request, Response } from "express"
import { BaseRepository, CommentRepository, LikeRepository , PostRepository} from "../../../DB/Repositories/index.js"
import { LikeOnModelEnum, type IRequest } from "../../../Common/index.js"
import type { Model, Types } from "mongoose"
import { BadRequestException, NotFoundException, successResponse } from "../../../Utils/index.js"
import mongoose from "mongoose"




class LikeService {

    private likeRepo:LikeRepository = new LikeRepository()
    private postRepo:PostRepository = new PostRepository()
    private commentRepo:CommentRepository = new CommentRepository()
    private repoMap:Record<LikeOnModelEnum , BaseRepository<any>> = {
        [LikeOnModelEnum.Post]:this.postRepo,
        [LikeOnModelEnum.Comment]:this.commentRepo,

    }

    toggleLike = async(req:Request , res:Response)=>{
        const {user:{_id}} = (req as IRequest).loggedInUser
        const {refId} = req.params
        const {onModel} = req.body as {onModel:LikeOnModelEnum}

        const targetRepo = this.repoMap[onModel]
        if(!targetRepo) throw new BadRequestException("Invalid onModel type. Must be 'Post' or 'Comment'")
        // console.log(targetRepo);
        
        const targetDoc = await targetRepo.findDocumentById(refId as string)
        if(!targetDoc) throw new NotFoundException(`${onModel} not found`)
            // console.log(targetDoc);
            
        const existingLike = await this.likeRepo.findOneDocument({
            userId:_id,
            onModel,
            refId
        })

        const session = await mongoose.startSession()
        let message = ''
        try{
            await session.withTransaction(async()=>{                
                if(existingLike){
                    await this.likeRepo.findDocumentByIdAndDelete(existingLike._id , {session})
                    await targetRepo.findByIdAndUpdateDocument(refId as string , {
                        $inc:{likesCount:-1}
                    } , {session})
                    message = "Unlike successfully"
                }else{
                    await this.likeRepo.createDocument({
                        userId:_id,
                        refId:refId as unknown as Types.ObjectId,
                        onModel
                    } , {session})
                    await targetRepo.findByIdAndUpdateDocument(refId as string, {
                        $inc:{likesCount:1}
                    } , {session})
                    message = `${onModel} liked successfully`
                }
            })
        }finally{
            await session.endSession()
        }

        return res.status(200).json(successResponse(message , 200 ))
    }

}


export default new LikeService()