import { GraphQLID, GraphQLInt, GraphQLObjectType, GraphQLString } from "graphql";
import { PaginatedPostType } from "./post.types.js";


export const UserType: GraphQLObjectType = new GraphQLObjectType({
    name: "UserType",
    fields: () => ({
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        profilePicture: { type: GraphQLString },
        coverPicture: { type: GraphQLString },
        gender: { type: GraphQLString },
        followersCount: { type: GraphQLInt },
        followingCount: { type: GraphQLInt },
        postsCount: { type: GraphQLInt },
        posts: {type: PaginatedPostType}
    })
})