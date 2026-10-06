import type { NextFunction, Request, Response } from "express"
import multer from "multer"
import { AllowedFileExtenstionsEnum, fileTypeEnum } from "../Common/index.js"
import { BadRequestException } from "../Utils/index.js"
import { fileTypeFromFile, fileTypeFromTokenizer, type FileTypeResult } from "file-type"
import { unlink } from "node:fs/promises"




export const uploadMedia = (
    allowedTypes: string[] = [fileTypeEnum.IMAGE, fileTypeEnum.VIDEO]
) => {
    const storage = multer.diskStorage({});
    const fileFilter = (req: Request , file: Express.Multer.File , cb: multer.FileFilterCallback
    ) => {
        const [fileMimeType, fileExtension] = file.mimetype.split("/");
        if (!fileMimeType || !allowedTypes.includes(fileMimeType)) {
            return cb(
                new BadRequestException(
                    `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
                )
            );
        }
        const allowedExtensions = AllowedFileExtenstionsEnum[fileMimeType] || [];
        if (!fileExtension || !allowedExtensions.includes(fileExtension.toLowerCase())) {
            return cb(
                new BadRequestException(
                    `Invalid file extension for ${fileMimeType}. Allowed: ${allowedExtensions.join(", ")}`
                )
            );
        }
        return cb(null, true);
    };
    return multer({
        storage,
        fileFilter,
        limits: { fileSize: 50 * 1024 * 1024 }
    });
};

export const uploadImage = () => uploadMedia([fileTypeEnum.IMAGE]);

export const validateImage = async(req:Request , res:Response ,next:NextFunction)=>{


    const file = req.file
    if(!file) throw new BadRequestException("Profile picture is required")

        try{
            const detectedType: FileTypeResult | undefined = await fileTypeFromFile(file.path)
            if (!detectedType) throw new BadRequestException("Unknown or unsupported file type");
            console.log(detectedType);

                
            const [fileMimeType , fileExtenstion] = detectedType.mime.split("/")
            if(!fileMimeType || !Object.values(fileTypeEnum).includes(fileMimeType))
                throw new BadRequestException(`File is not allowes. Allowed file types ${Object.values(fileTypeEnum)}`)
            if(!fileExtenstion || !AllowedFileExtenstionsEnum[fileMimeType]?.includes(fileExtenstion))
                throw new BadRequestException("File format is not allowed");
        }catch(err){
            await unlink(file.path)
            return next(err)
        }


        next()
        
}
