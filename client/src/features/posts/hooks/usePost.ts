import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreatePostPayload } from "../types/post.types";
import { postService } from "../api/post.service";
import { PROFILE_QUERY_KEY } from "@/features/profile";

export const useAddPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePostPayload | FormData) => postService.addPost(body),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },

    onError: (error) => {
      console.error("Failed to add post:", error);
    },
  });
};

export const useDeletePost = ()=>{
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:(postId:string)=>postService.deletePost(postId),
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:PROFILE_QUERY_KEY})
        },
        onError:(error)=>{
            console.log(error);
        }
    })

}