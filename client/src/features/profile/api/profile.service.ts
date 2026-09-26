import { apiClient } from "@/lib/axios";

export interface GraphQLPostDoc {
  _id: string;
  describtion?: string;
  attachments?: string[];
  allowComments?: boolean;
  commentsCount?: number;
  createdAt?: string;
}

export interface GraphQLUserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  coverPicture?: string;
  gender?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  posts?: {
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    docs: GraphQLPostDoc[];
  };
}

export const GET_PROFILE_QUERY = `
  query GetProfile($page: Int, $limit: Int) {
    getProfile(page: $page, limit: $limit) {
      _id
      firstName
      lastName
      email
      profilePicture
      coverPicture
      gender
      followersCount
      followingCount
      postsCount
      posts {
        totalDocs
        limit
        totalPages
        page
        docs {
          _id
          describtion
          attachments
          allowComments
          commentsCount
          createdAt
        }
      }
    }
  }
`;

export const profileService = {
  getProfile: async (page = 1, limit = 10): Promise<GraphQLUserProfile> => {
    const response = await apiClient.post("/graphql", {
      query: GET_PROFILE_QUERY,
      variables: { page, limit },
    });
    

    if (response.data?.errors && response.data.errors.length > 0) {
      throw new Error(
        response.data.errors[0].message || "GraphQL request failed"
      );
    }

    return response.data?.data?.getProfile;
  },


};
