import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { followService } from "../api/follow.service";
import { FollowRequestItem } from "../types/request.types";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export const FOLLOW_REQUESTS_QUERY_KEY = ["follow-requests"] as const;
import { PROFILE_QUERY_KEY } from "./useGetProfile";
import { FOLLOWER_QUERY_KEY, FOLLOW_QUERY_KEY } from "./useFollowingOrFollowers";

export function useFollowRequests() {
  const isAuth = useAuthStore((state) => state.isAuth);

  return useQuery({
    queryKey: FOLLOW_REQUESTS_QUERY_KEY,
    queryFn: async (): Promise<FollowRequestItem[]> => {
      const data = await followService.getFollowRequests();
      return Array.isArray(data) ? data : [];
    },
    enabled: isAuth,
    staleTime: 1000 * 30, 
  });
}

export function useRespondToFollowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      followFromId,
      response,
    }: {
      followFromId: string;
      response: "accept" | "reject";
    }) => {
      return await followService.respondToFollowRequest(followFromId, response);
    },

    onMutate: async ({ followFromId }) => {
      await queryClient.cancelQueries({ queryKey: FOLLOW_REQUESTS_QUERY_KEY });
      
      
      const previousRequests =
      queryClient.getQueryData<FollowRequestItem[]>(FOLLOW_REQUESTS_QUERY_KEY);
      console.log("previousRequests : " , previousRequests);

      if (previousRequests) {
        queryClient.setQueryData<FollowRequestItem[]>(
          FOLLOW_REQUESTS_QUERY_KEY,
          previousRequests.filter(
            (req) => req.followFromId?._id !== followFromId
          )
        );
      }

      return { previousRequests };
    },

    onError: (_err, _variables, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(
          FOLLOW_REQUESTS_QUERY_KEY,
          context.previousRequests
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLLOW_REQUESTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [FOLLOWER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FOLLOW_QUERY_KEY] });
    },
  });
}
