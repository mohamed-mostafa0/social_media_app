import type { UploadApiResponse } from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';


cloudinaryV2.config({
    api_key:process.env.CLOUDINARY_API_KEY,
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export const uploadMediaOnCloudinary = async(file:string , folderName:string)=>{
    const result = await cloudinaryV2.uploader.upload(file , {
        resource_type:"auto",
        folder:folderName
    })
    return result
}

export const uploadImageOnCloudinary = async(file:string , folderName:string):Promise<UploadApiResponse>=>{
    const result = await cloudinaryV2.uploader.upload(
        file,
        {
            resource_type:"image",
            folder:folderName
        }
    )
    return result
}


export const deleteImageFromCloudinary = async(publicId:string)=>{
    const result = await cloudinaryV2.uploader.destroy(
        publicId,
        {
            resource_type:"image"
        }
    )
    return result
}

export const uploadImagesOnCloudinary = async(files:string[] , folderName:string):Promise<UploadApiResponse[]>=>{
    const uploadPromises = files.map(file => uploadImageOnCloudinary(file, folderName));
const results = await Promise.all(uploadPromises);
    return results;
}

export const deleteImagesOnCloudinary = async(publicIds:string[])=>{
    const deletePromises = publicIds.map(publicId => deleteImageFromCloudinary(publicId));
    const results = await Promise.all(deletePromises);
    return results;
}
