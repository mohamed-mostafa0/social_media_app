import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentService } from "../api/comment.service";
import { CreateCommentPayload, EditCommentPayload } from "../types/comment.types";
import { PROFILE_QUERY_KEY } from "@/features/profile";

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: CreateCommentPayload | FormData }) =>
      CommentService.addComment(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to add comment:", error);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => CommentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to delete comment:", error);
    },
  });
};

export const useEditComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: EditCommentPayload | FormData }) =>
      CommentService.editComment(commentId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to edit comment:", error);
    },
  });
};

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => CommentService.toggleCommentLike(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to toggle comment like:", error);
    },
  });
};


