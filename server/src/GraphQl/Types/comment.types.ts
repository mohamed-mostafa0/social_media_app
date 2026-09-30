import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { UserType } from "./user.types.js";
import { PostType } from "./post.types.js";
import { CommentModel } from "../../DB/Models/comment.model.js";
import { formatRelativeDate } from "../../Utils/index.js";
import { LikeModel } from "../../DB/Models/like.model.js";
import { LikeOnModelEnum } from "../../Common/index.js";



const AttachmentType:GraphQLObjectType = new GraphQLObjectType({
    name:"AttachmentType",
    fields:()=>({
        url:{type:GraphQLString},
        publicId:{type:GraphQLString}
    })
})

export const CommentType:GraphQLObjectType = new GraphQLObjectType({
    name:"CommentType",
    fields:()=>({
        _id:{type:GraphQLID},
        content:{type:GraphQLString},
        attachment:{type:AttachmentType},
        ownerId:{type:UserType},
        parentCommentId:{type:CommentType},
        likesCount:{type:GraphQLInt},
        repliesCount:{type:GraphQLInt},
        createdAt:{type:GraphQLString , resolve: (comment: any) => formatRelativeDate(comment.createdAt)},
        replies:{
            type: new GraphQLList(CommentType),
            resolve:async(comment:any)=>{
                return await CommentModel.find({
                    parentCommentId:comment._id
                }).sort({createdAt:1}).populate("ownerId")
            }
        },
        isLiked: {
            type: GraphQLBoolean,
            resolve: async (comment: any, _args: any, context: any) => {
                const userId = context?.user?.user?._id;
                if (!userId) return false;
                return Boolean(
                    await LikeModel.exists({
                        userId,
                        onModel: LikeOnModelEnum.Comment,
                        refId: comment._id
                    })
                );
            }
        }

    })
})