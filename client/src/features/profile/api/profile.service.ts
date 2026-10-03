import { apiClient } from "@/lib/axios";
import { UpdateProfilePayload, User } from "@/types/user.types";


export interface GraphQlUserType {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface GraphQLComment {
  _id: string;
  content: string;
  likesCount?: number;
  repliesCount?: number;
  createdAt?: string;
  isLiked?: boolean;
  attachment?: {
    url: string;
    publicId?: string;
  };
  ownerId: GraphQlUserType;
  replies?: GraphQLComment[];
}

export interface GraphQLPostDoc {
  _id: string;
  describtion?: string;
  attachments?: string[];
  allowComments?: boolean;
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  tags?: GraphQlUserType[];
  comments?: GraphQLComment[];
  isLiked?: boolean;
}

export interface GraphQLUserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  coverPicture?: string;
  gender?: string;
  DOB?: string;
  location?: {
    city?: string;
    governrate?: string;
    country?: string;
    street?: string;
  };
  education?: {
    university?: string;
    college?: string;
    major?: string;
    graduationYear?: number;
  };
  socialLinks?: Array<{
    platformName?: string;
    link?: string;
  }>;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isPrivate?: boolean;
  isSelf?: boolean;
  followStatus?: "ACCEPTED" | "PENDING" | "NONE";
  posts?: {
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    docs: GraphQLPostDoc[];
  };
}

export const GET_PROFILE_QUERY = `
  query GetProfile($userId: ID, $page: Int, $limit: Int) {
    getProfile(userId: $userId, page: $page, limit: $limit) {
      _id
      firstName
      lastName
      email
      profilePicture
      coverPicture
      gender
      DOB
      location {
        city
        governrate
        country
        street
      }
      education {
        university
        college
        major
        graduationYear
      }
      socialLinks {
        platformName
        link
      }
      followersCount
      followingCount
      postsCount
      isPrivate
      isSelf
      followStatus
      posts {
        totalDocs
        limit
        totalPages
        page
        pagingCounter
        hasPrevPage
        hasNextPage
        prevPage
        nextPage
        docs {
          _id
          describtion
          attachments
          allowComments
          likesCount
          commentsCount
          isLiked
          createdAt
          tags {
            _id
            firstName
            lastName
            profilePicture
          }
          comments {
            _id
            content
            likesCount
            repliesCount
            createdAt
            isLiked
            attachment {
              url
            }
            ownerId {
              _id
              firstName
              lastName
              profilePicture
            }
            replies {
              _id
              content
              likesCount
              createdAt
              isLiked
              attachment {
                url
              }
              ownerId {
                _id
                firstName
                lastName
                profilePicture
              }
            }
          }
        }
      }
    }
  }
`;

export const profileService = {
  getProfile: async (userId?: string, page = 1, limit = 10): Promise<GraphQLUserProfile> => {
    const response = await apiClient.post("/graphql", {
      query: GET_PROFILE_QUERY,
      variables: { userId: userId || null, page, limit },
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      throw new Error(
        response.data.errors[0].message || "GraphQL request failed"
      );
    }

    return response.data?.data?.getProfile;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const response = await apiClient.put("/profile", payload);
    return response.data?.data?.data || response.data?.data;
  },
};


