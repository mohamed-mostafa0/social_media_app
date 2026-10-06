import mongoose from "mongoose";
import type { IStoryViewer } from "../../Common/index.js";



const storyViewerSchema = new mongoose.Schema<IStoryViewer>({
    storyId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Story"
    },
    ownerId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    viewedAt:{
        type:Date,
        default:Date.now
    },
    expiresAt:{
        type:Date,
        required:true
    }

}, {
    timestamps:true
})

storyViewerSchema.index({ storyId:1 , ownerId:1 } , {
    unique:true
})

storyViewerSchema.index({expiresAt:1} , {
    expireAfterSeconds:0
})

export const StoryViewerModel = mongoose.model<IStoryViewer>("StoryViewer" , storyViewerSchema)
