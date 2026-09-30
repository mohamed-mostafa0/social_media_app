import { apiClient } from "@/lib/axios";
import { CreateCommentPayload, EditCommentPayload } from "../types/comment.types";

export const CommentService = {
  addComment: async (postId: string, body: CreateCommentPayload | FormData) => {
    let payload: FormData | CreateCommentPayload = body;

    if (!(body instanceof FormData) && body.attachment) {
      const formData = new FormData();
      if (body.content) formData.append("content", body.content);
      if (body.parentCommentId) formData.append("parentCommentId", body.parentCommentId);
      formData.append("attachment", body.attachment);
      payload = formData;
    }

    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const response = await apiClient.post(`/comment/${postId}`, payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await apiClient.delete(`/comment/${commentId}`);
    return response.data;
  },

  editComment: async (commentId: string, body: EditCommentPayload | FormData) => {
    let payload: FormData | EditCommentPayload = body;

    if (!(body instanceof FormData) && (body.attachment || body.removeAttachment !== undefined)) {
      const formData = new FormData();
      if (body.content !== undefined) formData.append("content", body.content);
      if (body.removeAttachment !== undefined) formData.append("removeAttachment", String(body.removeAttachment));
      if (body.attachment) formData.append("attachment", body.attachment);
      payload = formData;
    }

    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;
    const response = await apiClient.patch(`/comment/${commentId}`, payload, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data;
  },

  toggleCommentLike: async (commentId: string) => {
    const response = await apiClient.post(`/like/${commentId}`, { onModel: "Comment" });
    return response.data;
  },
};