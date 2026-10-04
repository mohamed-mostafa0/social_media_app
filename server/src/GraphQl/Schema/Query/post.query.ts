import { GraphQLList } from "graphql";
import { PaginatedPostType, PostType } from "../../Types/post.types.js";
import { GetFeedArgsType } from "../../Args/post.args.js";
import PostResolver from "../../Resolvers/post.resolver.js";


class PostQuery {

    private postResolver: PostResolver = new PostResolver()

    register() {
        return {
            getFeed: {
                type:PaginatedPostType,
                args: GetFeedArgsType,
                resolve: this.postResolver.getFeed
            }
        }
    }
}

export default new PostQuery()
