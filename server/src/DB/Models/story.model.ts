import mongoose from "mongoose";
import type { IStory } from "../../Common/index.js";

const storySchema = new mongoose.Schema<IStory>(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        media: {
            url: { type: String, required: true },
            publicId: String,
            mediaType: {
                type: String,
                enum: ["image", "video"],
                default: "image",
            },
        },
        caption: {
            type: String,
            trim: true,
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), 
        },
    },
    { timestamps: true }
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

storySchema.index({ ownerId: 1, expiresAt: 1 });

export const StoryModel = mongoose.model<IStory>("Story", storySchema);
