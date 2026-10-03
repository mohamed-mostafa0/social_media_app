import { followStatusEnum } from "../../Common/index.js";
import { UserModel } from "../../DB/Models/index.js";
import { FollowRepository, PostRepository, UserRepository } from "../../DB/Repositories/index.js";
import { BadRequestException } from "../../Utils/index.js";


class UserResolver {

    private userRepo: UserRepository = new UserRepository(UserModel)
    private postRepo:PostRepository = new PostRepository()
    private followRepo:FollowRepository = new FollowRepository()

    getProfile = async (_: any, args: {userId?:string , page?:number , limit?:number }, context: any) => {
        const { page , limit } = args
        const loggedInUserId = context.user.user._id

        const targetUser = args.userId || loggedInUserId
        const isSelf = !args.userId || args.userId.toString() === loggedInUserId.toString()

        const user = await this.userRepo.findDocumentById(targetUser)
        if (!user) throw new BadRequestException("User not found")
        
        const isFollow = !isSelf ? await this.followRepo.findOneDocument({
            followFromId: loggedInUserId,
            followToId: targetUser
        }) : null

        const isAllowedToViewProfile = isSelf || !user.isPrivate || isFollow?.status === followStatusEnum.ACCEPTED
        const posts = isAllowedToViewProfile ?
         await this.postRepo.postPagination({ ownerId: targetUser }, { page, limit })
        : { docs: [], totalDocs: 0 };

        const followStatus = isFollow ? (isFollow.status ? isFollow.status.toUpperCase() : "NONE") : "NONE";

        return {
            ...(user.toObject ? user.toObject() : user),
            isSelf,
            followStatus, 
            posts
        }


     
    }
}

export default UserResolver