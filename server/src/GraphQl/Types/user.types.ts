import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { PaginatedPostType } from "./post.types.js";

export const UserLocationType = new GraphQLObjectType({
    name: "UserLocationType",
    fields: () => ({
        city: { type: GraphQLString },
        governrate: { type: GraphQLString },
        country: { type: GraphQLString },
        street: { type: GraphQLString },
    })
});

export const UserEducationType = new GraphQLObjectType({
    name: "UserEducationType",
    fields: () => ({
        university: { type: GraphQLString },
        college: { type: GraphQLString },
        major: { type: GraphQLString },
        graduationYear: { type: GraphQLInt },
    })
});

export const UserSocialLinkType = new GraphQLObjectType({
    name: "UserSocialLinkType",
    fields: () => ({
        platformName: { type: GraphQLString },
        link: { type: GraphQLString },
    })
});

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
        DOB: { type: GraphQLString },
        location: { type: UserLocationType },
        education: { type: UserEducationType },
        socialLinks: { type: new GraphQLList(UserSocialLinkType) },
        followersCount: { type: GraphQLInt },
        followingCount: { type: GraphQLInt },
        postsCount: { type: GraphQLInt },
        isPrivate: { type: GraphQLBoolean },
        isSelf: {
            type: GraphQLBoolean,
            resolve: (user: any, _args: any, context: any) => {
                if (typeof user?.isSelf === "boolean") return user.isSelf;
                const loggedInUserId = context.user?.user?._id;
                if (!loggedInUserId || !user?._id) return false;
                return user._id.toString() === loggedInUserId.toString();
            }
        },
        followStatus: { type: GraphQLString },

        posts: { type: PaginatedPostType }
    })
})