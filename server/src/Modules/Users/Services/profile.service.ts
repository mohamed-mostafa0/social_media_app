import type { Request, Response } from "express";
import { FollowRepository, UserRepository } from "../../../DB/Repositories/index.js";
import { UserModel } from "../../../DB/Models/index.js";
import mongoose from "mongoose";
import { BadRequestException, deleteImageFromCloudinary, successResponse, uploadImageOnCloudinary } from "../../../Utils/index.js";
import { followStatusEnum, type IRequest, type IUser } from "../../../Common/index.js";




class ProfileService {

    private userRepo: UserRepository = new UserRepository(UserModel)
    private followRepo = new FollowRepository()


    uploadProfilePicture = async (req: Request, res: Response) => {
        const { user } = (req as unknown as IRequest).loggedInUser
        const file: Express.Multer.File | undefined = req.file
        if (!file) throw new BadRequestException("please attach an image")

        let result;
        if (user.profilePictureId) {
            await deleteImageFromCloudinary(user.profilePictureId)
        }
        try {
            result = await uploadImageOnCloudinary(file.path, "profile-picture");
        } catch (error) {
            throw new BadRequestException("Failed to upload image", error as Error);
        }

        const updatedUser = await this.userRepo.findByIdAndUpdateDocument(user._id as mongoose.Types.ObjectId, {
            profilePicture: result.secure_url,
            profilePictureId: result.public_id
        }, { new: true });

        if (!updatedUser) throw new BadRequestException("Failed to update profile picture");

        return res.status(200).json(successResponse("Profile picture updated successfully", 200, updatedUser));
    }


    uploadCoverPicture = async (req: Request, res: Response) => {
        const { user } = (req as unknown as IRequest).loggedInUser
        const file: Express.Multer.File | undefined = req.file
        if (!file) throw new BadRequestException("please attach an image")

        let result;
        if (user.coverPictureId) {
            await deleteImageFromCloudinary(user.coverPictureId)
        }
        try {
            result = await uploadImageOnCloudinary(file.path, "cover-picture");
        } catch (error) {
            throw new BadRequestException("Failed to upload image", error as Error);
        }

        const updatedUser = await this.userRepo.findByIdAndUpdateDocument(user._id as mongoose.Types.ObjectId, {
            coverPicture: result.secure_url,
            coverPictureId: result.public_id
        }, { new: true });

        if (!updatedUser) throw new BadRequestException("Failed to update cover picture");

        return res.status(200).json(successResponse("Cover picture updated successfully", 200, updatedUser));
    }


    getProfile = async (req: Request<{ id: string }>, res: Response) => {
        const id = req.params.id as unknown as mongoose.Types.ObjectId

        // const id = new mongoose.Types.ObjectId(req.params.id)
        console.log(id);
        console.log(typeof id);
        const user = await this.userRepo.findDocumentById(id)
        if (!user) throw new BadRequestException('User Not Found')

        return res.status(200).json(successResponse("", 200, user))
    }

    updateProfile = async (req: Request, res: Response) => {
        const { firstName, lastName, password, phoneNumber, gender }: Partial<IUser> = req.body
        const { user } = (req as unknown as IRequest).loggedInUser

        await this.userRepo.findOneupdateDocument(
            { _id: user._id, email: user.email },
            { $set: { firstName, lastName, password, gender, phoneNumber } },
            { new: true }
        )
        return res.json(successResponse("Profile Updated Successfully", 200))
    }

    toggleFollow = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser;
        const { followToId } = req.params;
        if (!followToId) throw new BadRequestException("Following id is required");
        if (!mongoose.isValidObjectId(followToId)) throw new BadRequestException("Invalid following id");
        if (user._id.toString() === followToId.toString()) throw new BadRequestException("You cannot follow yourself");

        const targetUser = await this.userRepo.findDocumentById(followToId as unknown as mongoose.Types.ObjectId);
        if (!targetUser || targetUser.isDeleted || targetUser.isDeactivated) {
            throw new BadRequestException("User not found or account is deactivated");
        }

        const existingFollow = await this.followRepo.findOneDocument({
            followFromId: user._id,
            followToId: followToId as unknown as mongoose.Types.ObjectId
        });

        let message: string;
        let statusCode = 200;

        if (existingFollow) {
            await this.followRepo.findDocumentByIdAndDelete(existingFollow._id);
            if (existingFollow.status === followStatusEnum.ACCEPTED) {
                targetUser.followersCount = Math.max(0, (targetUser.followersCount || 0) - 1);
                user.followingCount = Math.max(0, (user.followingCount || 0) - 1);
                await targetUser.save();
                await user.save();
                message = "User unfollowed successfully";
            } else {
                message = "Follow request cancelled successfully";
            }
        } else {
            const isTargetPrivate = Boolean(targetUser.isPrivate);
            const status = isTargetPrivate ? followStatusEnum.PENDING : followStatusEnum.ACCEPTED;
            await this.followRepo.createDocument({
                followFromId: user._id,
                followToId: followToId as unknown as mongoose.Types.ObjectId,
                status
            });
            if (isTargetPrivate) {
                message = "Follow request sent successfully";
            } else {
                targetUser.followersCount = (targetUser.followersCount || 0) + 1;
                user.followingCount = (user.followingCount || 0) + 1;
                await targetUser.save();
                await user.save();
                message = "User followed successfully";
            }
            statusCode = 201;
        }
        return res.status(statusCode).json(successResponse(message, statusCode));
    };

    listRequests = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser

        const requests = await this.followRepo.findDocuments({
            followToId: user._id,
            status: followStatusEnum.PENDING
        }, {}, {
            populate: {
                path: "followFromId",
                select: "firstName lastName profilePicture"
            }
        })
        return res.status(200).json(successResponse("Requests fetched successfully", 200, requests))
    }

    respondToFollowRequest = async (req: Request, res: Response) => {
        const { user } = (req as IRequest).loggedInUser;
        const { followFromId, response } = req.body;

        if (!followFromId || !response) throw new BadRequestException("Missing details");
        if (!mongoose.isValidObjectId(followFromId)) throw new BadRequestException("Invalid followFromId");
        if (!["accept", "reject"].includes(response)) {
            throw new BadRequestException("Response must be either 'accept' or 'reject'");
        }

        const existingFollow = await this.followRepo.findOneDocument({
            followFromId,
            followToId: user._id,
            status: followStatusEnum.PENDING
        });

        if (!existingFollow) throw new BadRequestException("Request not found or already processed");

        const targetUser = await this.userRepo.findDocumentById(existingFollow.followFromId);
        if (!targetUser || targetUser.isDeleted || targetUser.isDeactivated) {
            await this.followRepo.findDocumentByIdAndDelete(existingFollow._id);
            throw new BadRequestException("User not found or account is deactivated");
        }

        if (response === "accept") {
            existingFollow.status = followStatusEnum.ACCEPTED;

            await Promise.all([
                existingFollow.save(),
                this.userRepo.findByIdAndUpdateDocument(targetUser._id, {
                    $inc: { followingCount: 1 }
                }),
                this.userRepo.findByIdAndUpdateDocument(user._id, {
                    $inc: { followersCount: 1 }
                })
            ]);

            return res.status(200).json(successResponse("Follow request accepted successfully", 200));
        } else {
            await this.followRepo.findDocumentByIdAndDelete(existingFollow._id);
            return res.status(200).json(successResponse("Follow request rejected successfully", 200));
        }
    }

    getFollowers = async (req: Request, res: Response) => {
        const { user: { _id } } = (req as IRequest).loggedInUser;

        const [followers, following] = await Promise.all([
            this.followRepo.findDocuments(
                {
                    followToId: _id,
                    status: followStatusEnum.ACCEPTED,
                },
                {},
                {
                    populate: {
                        path: "followFromId",
                        select: "_id profilePicture firstName lastName",
                    },
                }
            ),
            this.followRepo.findDocuments(
                {
                    followFromId: _id,
                    status: followStatusEnum.ACCEPTED,
                },
                { followToId: 1 }
            ),
        ]);

        const followingIds = new Set(
            following.map((f) => f.followToId?.toString()).filter(Boolean)
        );

        const filteredFollowers = followers.map((f) => {
            const followerObj = typeof (f as any).toObject === "function" ? (f as any).toObject() : f;
            const followerUserId = followerObj.followFromId?._id?.toString() || followerObj.followFromId?.toString();

            return {
                ...followerObj,
                isFollowing: Boolean(followerUserId && followingIds.has(followerUserId)),
            };
        });

        return res.status(200).json(successResponse("", 200, filteredFollowers));
    };

    getFollowings = async (req:Request , res:Response)=>{
        const {user:{_id}} = (req as IRequest).loggedInUser

        const following = await this.followRepo.findDocuments({
            followFromId:_id,
            status:followStatusEnum.ACCEPTED
        } , {} , {
            populate:{
                path:"followToId",
                select:"_id profilePicture firstName lastName"
            }
        })

        return res.status(200).json(successResponse("",200,following))
    }

    removeFollower = async(req:Request , res:Response)=>{
        const{user:{_id}} = (req as IRequest).loggedInUser
        const {followFromId} = req.params

        if(!followFromId) throw new BadRequestException("followFromId is required")

        const session = await mongoose.startSession()
        try{
            await session.withTransaction(async()=>{
                 const isUserExist = await this.userRepo.findDocumentById(followFromId as string ,{} , {session})
                if(!isUserExist || isUserExist.isDeleted) throw new BadRequestException("User not found or account is deleted")
                
                const existingFollow = await this.followRepo.findOneDocument({
                    followFromId:followFromId as string,
                    followToId:_id,
                    status:followStatusEnum.ACCEPTED
                } , {} , {session})

                if(!existingFollow) throw new BadRequestException("Follow relationship not found")
                

                const deletedFollow =await this.followRepo.findDocumentByIdAndDelete(existingFollow._id , {session})
                if(!deletedFollow) throw new BadRequestException("Failed to delete follow relationship")


                const updatedUser = await this.userRepo.findByIdAndUpdateDocument(_id , {
                    $inc:{followersCount:-1}
                } ,{session})
                if(!updatedUser) throw new BadRequestException("Failed to update user")

                const updatedTargetUser = await this.userRepo.findByIdAndUpdateDocument(followFromId as string, {
                    $inc:{followingCount:-1}
                } ,{session})
                if(!updatedTargetUser) throw new BadRequestException("Failed to update target user")

                })
                
            }finally{
                await session.endSession()
            }
        return res.status(200).json(successResponse("Follower removed successfully",200))

    }



    
}


export default new ProfileService()