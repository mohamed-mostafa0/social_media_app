import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { UserType } from "./user.types.js";
import { formatRelativeDate } from "../../Utils/index.js";

export const PostType: GraphQLObjectType = new GraphQLObjectType({
    name: "PostType",
    fields: () => ({
        _id: { type: GraphQLID },
        describtion: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },
        allowComments: { type: GraphQLBoolean },
        owner: {
            type: UserType,
            resolve: (post: any) => post.ownerId
        },
        tags: {
            type: new GraphQLList(UserType),
            resolve: (post: any) => post.tags ?? []
        },
        createdAt: {
            type: GraphQLString,
            resolve: (post: any) => formatRelativeDate(post.createdAt)
        }
    })
})

export const PaginatedPostType: GraphQLObjectType = new GraphQLObjectType({
    name: "PaginatedPostType",
    fields: () => ({
        docs: { type: new GraphQLList(PostType) },
        totalDocs: { type: GraphQLInt },
        limit: { type: GraphQLInt },
        totalPages: { type: GraphQLInt },
        page: { type: GraphQLInt },
        pagingCounter: { type: GraphQLInt },
        hasPrevPage: { type: GraphQLBoolean },
        hasNextPage: { type: GraphQLBoolean },
        prevPage: { type: GraphQLInt },
        nextPage: { type: GraphQLInt }
    })
})
