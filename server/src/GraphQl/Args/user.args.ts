import { GraphQLID, GraphQLInt } from "graphql";

export const GetProfileArgsType = {
    userId: { type: GraphQLID },
    page: { type: GraphQLInt, defaultValue: 1 },
    limit: { type: GraphQLInt, defaultValue: 10 }
}