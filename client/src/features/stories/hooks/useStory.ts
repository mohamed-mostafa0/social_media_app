import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StoryService } from "../api/story.service";

export const STORIES_QUERY_KEY = ["stories"];
export const STORY_QUERY_KEY = (id: string) => ["story", id];

export const useStories = () => {
  return useQuery({
    queryKey: STORIES_QUERY_KEY,
    queryFn: async () => StoryService.getStories(),
  });
};

export const useStory = (storyId: string) => {
  return useQuery({
    queryKey: STORY_QUERY_KEY(storyId),
    queryFn: async () => StoryService.getStory(storyId),
    enabled: Boolean(storyId),
  });
};

export const getStory = useStory;

export const useAddStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => StoryService.addStory(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORIES_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to add story:", error);
    },
  });
};

export const useViewStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => StoryService.viewStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORIES_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to view story:", error);
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => StoryService.deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORIES_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to delete story:", error);
    },
  });
};
