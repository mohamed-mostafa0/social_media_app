import { CommentModel } from "../../DB/Models/index.js";
import { CommentRepository, PostRepository } from "../../DB/Repositories/index.js";


class PostResolver {

    private postRepo: PostRepository = new PostRepository()
    private commentRepo: CommentRepository = new CommentRepository()

    getFeed = async (_: any, args: { page: number; limit: number }, context: any) => {
        const { page, limit } = args
        const loggedInUserId = context.user.user._id

        const result = await this.postRepo.postPagination(
            {ownerId:{$ne:loggedInUserId}},
            {
                page,
                limit,
                populate: {
                    path: "ownerId",
                    select: "firstName lastName profilePicture gender isPrivate"
                },

                lean: true
            }
        )

        return result  
    }
}

export default PostResolver
