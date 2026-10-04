import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreatePostPayload, EditPostPayload } from "../types/post.types";
import { postService } from "../api/post.service";
import { PROFILE_QUERY_KEY } from "@/features/profile";

export const MAIN_FEED_QUERY_KEY = ["main-feed"];

export const useMainFeed = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: MAIN_FEED_QUERY_KEY,
    queryFn: ({ pageParam = 1 }) => postService.getMainFeed(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage?.hasNextPage) {
        return (lastPage.page || 1) + 1;
      }
      return undefined;
    },
  });
};

export const useAddPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePostPayload | FormData) => postService.addPost(body),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MAIN_FEED_QUERY_KEY });
    },

    onError: (error) => {
      console.error("Failed to add post:", error);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MAIN_FEED_QUERY_KEY });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

export const useEditPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, body }: { postId: string; body: EditPostPayload | FormData }) =>
      postService.editPost(postId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MAIN_FEED_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to edit post:", error);
    },
  });
};

export const useTogglePostLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => postService.togglePostLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: MAIN_FEED_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to toggle post like:", error);
    },
  });
};