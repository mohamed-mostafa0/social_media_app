import { apiClient } from "@/lib/axios";
import { IStory, IStoryViewer, IUserStoryGroup } from "../types/story.types";

export const StoryService = {
  getStories: async (): Promise<IUserStoryGroup[]> => {
    const response = await apiClient.get("/story/stories");
    const payload = response.data?.data?.data ?? response.data?.data;
    return Array.isArray(payload) ? payload : [];
  },

  getStory: async (storyId: string): Promise<IStory> => {
    const response = await apiClient.get(`/story/${storyId}`);
    return response.data?.data?.data ?? response.data?.data;
  },

  getStoryViewers: async (storyId: string): Promise<IStoryViewer[]> => {
    const response = await apiClient.get(`/story/${storyId}/viewers`);
    const payload = response.data?.data?.data ?? response.data?.data;
    return Array.isArray(payload) ? payload : [];
  },

  toggleStoryLike: async (storyId: string) => {
    const response = await apiClient.post(`/like/${storyId}`, { onModel: "Story" });
    return response.data;
  },

  addStory: async (body: FormData): Promise<IStory> => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const response = await apiClient.post("/story/add", body, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
    });
    return response.data?.data?.data ?? response.data?.data;
  },

  viewStory: async (storyId: string) => {
    const response = await apiClient.post(`/story/view/${storyId}`);
    return response.data?.data?.data ?? response.data?.data;
  },

  deleteStory: async (storyId: string) => {
    const response = await apiClient.delete(`/story/${storyId}`);
    return response.data;
  },
};