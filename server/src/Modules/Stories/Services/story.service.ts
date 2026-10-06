import type { Request, Response } from "express"
import { StoryRepository } from "../../../DB/Repositories/index.js"
import { fileTypeEnum, type IRequest, type IStory } from "../../../Common/index.js"
import type { Multer } from "multer"
import { BadRequestException, successResponse, uploadMediaOnCloudinary } from "../../../Utils/index.js"
import { unlink } from "node:fs/promises"




class StoryService {
    private StoryRepo:StoryRepository = new StoryRepository()


    addStory = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser;
        const file = req.file;
        const { caption } = req.body;

        if (!file) {
            throw new BadRequestException("Media file (image or video) is required");
        }
        let uploadedMedia: any = null;
        try {
            uploadedMedia = await uploadMediaOnCloudinary(file.path, "stories");
        } finally {
            if (file?.path) {
                await unlink(file.path).catch(() => {});
            }
        }
        const mediaType =
            uploadedMedia.resource_type === fileTypeEnum.VIDEO? fileTypeEnum.VIDEO : fileTypeEnum.IMAGE;

        const createdStory: IStory = await this.StoryRepo.createDocument({
            ownerId: user._id,
            media: {
                url: uploadedMedia.secure_url,
                publicId: uploadedMedia.public_id,
                mediaType,
            },
            ...(caption && { caption }),
        });
        return res.status(201).json(successResponse("Story added successfully", 201, createdStory));
    };
}


export default new StoryService()