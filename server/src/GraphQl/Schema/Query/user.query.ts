import { UserType } from "../../Types/user.types.js";
import { GetProfileArgsType } from "../../Args/user.args.js";
import UserResolver from "../../Resolvers/user.resolver.js";
import { GraphQLString } from "graphql";


class UserQuery {

    private userResolver: UserResolver = new UserResolver()

    getProfile() {
        return {
            getProfile: {
                type: UserType,
                args: GetProfileArgsType,
                resolve: this.userResolver.getProfile
            }
        }
    }
}

export default new UserQuery()