import { apiClient } from "@/lib/axios";
import { FollowRequestItem, FollowRelationItem } from "../types/request.types";

export const followService = {
  getFollowRequests: async (): Promise<FollowRequestItem[]> => {
    const response = await apiClient.get("/profile/list-requests");    
    return response.data?.data?.data || [];
  },

  respondToFollowRequest: async (
    followFromId: string,
    response: "accept" | "reject"
  ) => {
    const res = await apiClient.patch("/profile/respond-to-follow-request", {
      followFromId,
      response,
    });
    return res.data;
  },

  toggleFollow: async (followToId: string) => {
    const res = await apiClient.post(`/profile/toggle-follow/${followToId}`);
    return res.data;
  },

  getFollowers: async (): Promise<FollowRelationItem[]> => {
    const res = await apiClient.get("/profile/followers");    
    return res.data?.data?.data || [];
  },
  getFollowings: async (): Promise<FollowRelationItem[]> => {
    const res = await apiClient.get("/profile/followings");
    return res.data?.data?.data || [];
  },

  removeFollower: async (followFromId: string) => {
    const res = await apiClient.delete(`/profile/remove-follower/${followFromId}`);
    return res.data;
  },
};
