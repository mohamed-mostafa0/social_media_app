import { useQuery } from "@tanstack/react-query";
import { profileService, GraphQLUserProfile } from "../api/profile.service";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export const PROFILE_QUERY_KEY = ["user-profile"] as const;

export function useGetProfile(userId?: string, page = 1, limit = 10) {
  const isAuth = useAuthStore((state) => state.isAuth);

  return useQuery<GraphQLUserProfile>({
    queryKey: [...PROFILE_QUERY_KEY, userId || "me", { page, limit }],
    queryFn: () => profileService.getProfile(userId, page, limit),
    enabled: isAuth,
    staleTime: 1000 * 60,
  });
}

