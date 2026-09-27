import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../api/profile.service";
import { UpdateProfilePayload, User } from "@/types/user.types";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { PROFILE_QUERY_KEY } from "./useGetProfile";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (updatedUser: User) => {
      if (updatedUser && currentUser) {
        setUser({
          ...currentUser,
          ...updatedUser,
        });
      }
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
}
