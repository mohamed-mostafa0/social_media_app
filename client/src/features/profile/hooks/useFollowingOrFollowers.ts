import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followService } from "../api/follow.service";
import { PROFILE_QUERY_KEY } from "./useGetProfile";
import { FollowRelationItem } from "../types/request.types";

export const FOLLOW_QUERY_KEY = "following";
export const FOLLOWER_QUERY_KEY = "followers";

export const useGetFollowers = () => {
  return useQuery<FollowRelationItem[]>({
    queryKey: [FOLLOWER_QUERY_KEY],
    queryFn: async () => {
      const res = await followService.getFollowers();
      return res;
    },
  });
};

export const useGetFollowings = () => {
  return useQuery<FollowRelationItem[]>({
    queryKey: [FOLLOW_QUERY_KEY],
    queryFn: async () => {
      const res = await followService.getFollowings();
      return res;
    },
  });
};

export const useToggleFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (followToId: string) => followService.toggleFollow(followToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLLOW_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FOLLOWER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

export const useRemoveFollower = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (followFromId: string) => followService.removeFollower(followFromId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FOLLOWER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [FOLLOW_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

export const userGetFollowers = useGetFollowers;
export const userGetFollowings = useGetFollowings;