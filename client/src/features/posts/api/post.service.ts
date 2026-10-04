import { apiClient } from "@/lib/axios";
import { CreatePostPayload, EditPostPayload } from "../types/post.types";
import { GraphQLComment, GraphQlUserType } from "@/features/profile";

export interface GraphQlMainFeedPost {
    _id:string;
    describtion?:string;
    attachments?:string[];
    allowComments?:boolean;
    likesCount?:number;
    commentsCount?:number;
    createdAt?:string;
    isLiked?:boolean;
    owner?:GraphQlUserType;
    tags?:GraphQlUserType[];
    comments?:GraphQLComment[]
}

export interface GraphQlMainFeed{
    totalDocs:number;
    limit:number;
    totalPages:number;
    page:number;
    pagingCounter:number;
    hasPrevPage:boolean;
    hasNextPage:boolean;
    prevPage:unknown;
    nextPage:unknown;
    docs:GraphQlMainFeedPost[]
}


const GET_FEED_QUERY = `
query GetFeed($page: Int, $limit: Int) {
    getFeed(page: $page, limit: $limit) {

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
            createdAt
            isLiked
            owner {
                _id
                firstName
                lastName
                profilePicture
            }
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
                    publicId
                }
                replies {
                    _id
                    content
                    likesCount
                    repliesCount
                    createdAt
                    isLiked
                    attachment {
                        url
                        publicId
                    }
                    ownerId {
                        _id
                        firstName
                        lastName
                        profilePicture
                    }
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

`

export const postService = {
  addPost: async (body: CreatePostPayload | FormData) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const response = await apiClient.post("/post/add", body, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await apiClient.delete(`/post/${postId}`);
    return response.data;
  },

  editPost: async (postId: string, body: EditPostPayload | FormData) => {
    let payload: FormData | EditPostPayload = body;

    if (!(body instanceof FormData)) {
      const formData = new FormData();
      if (body.describtion !== undefined) formData.append("describtion", body.describtion);
      if (body.allowComments !== undefined) formData.append("allowComments", String(body.allowComments));
      if (body.removeAttachments !== undefined) {
        if (typeof body.removeAttachments === "boolean") {
          formData.append("removeAttachments", String(body.removeAttachments));
        } else {
          formData.append("removeAttachments", JSON.stringify(body.removeAttachments));
        }
      }
      if (body.images && body.images.length > 0) {
        body.images.forEach((file) => formData.append("images", file));
      }
      payload = formData;
    }

    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const response = await apiClient.patch(`/post/${postId}`, payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  togglePostLike: async (postId: string) => {
    const response = await apiClient.post(`/like/${postId}`, { onModel: "Post" });
    return response.data;
  },

  getMainFeed: async(page=1 , limit=10):Promise<GraphQlMainFeed>=>{
    const response = await apiClient.post("/graphql" , {
      query:GET_FEED_QUERY,
      variables:{page , limit}
    })

    if (response.data?.errors && response.data.errors.length > 0) {
      throw new Error(
        response.data.errors[0].message || "GraphQL request failed"
      );
    }

    return response.data?.data?.getFeed;

}
}
