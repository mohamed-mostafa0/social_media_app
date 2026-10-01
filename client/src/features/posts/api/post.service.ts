import { apiClient } from "@/lib/axios";
import { CreatePostPayload, EditPostPayload } from "../types/post.types";

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
};
