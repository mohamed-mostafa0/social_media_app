import {Router} from 'express'
import profileService from '../Services/profile.service.js'
import { authentication, validation } from '../../../Middlewares/index.js'
import { uploadImage, validateImage } from '../../../Middlewares/multer.middleware.js'
import { updateUserValidator } from '../../../Validators/index.js'

export const profileController = Router()

profileController.put("" , authentication,validation(updateUserValidator) ,profileService.updateProfile)

profileController.post("/upload-profile-picture",
    authentication ,
    uploadImage().single("profile-picture") ,
    validateImage ,profileService.uploadProfilePicture )

profileController.post("/upload-cover-picture",
    authentication,
    uploadImage().single("cover-picture"),
    validateImage, 
    profileService.uploadCoverPicture )
    
profileController.post("/toggle-follow/:followToId" , authentication , profileService.toggleFollow)

profileController.get("/profile/:id" , profileService.getProfile)

profileController.get("/list-requests" , authentication , profileService.listRequests)

profileController.patch("/respond-to-follow-request", authentication, profileService.respondToFollowRequest)

profileController.get("/followers" , authentication , profileService.getFollowers)

profileController.get("/followings" , authentication , profileService.getFollowings)

profileController.delete("/remove-follower/:followFromId" , authentication , profileService.removeFollower)


