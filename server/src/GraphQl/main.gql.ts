import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import userQuery from "./Schema/Query/user.query.js";
import postQuery from "./Schema/Query/post.query.js";


export const MainSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "QueryMainSchema",
        fields: {
            ...userQuery.getProfile(),
            ...postQuery.register()
        }
    }),
})