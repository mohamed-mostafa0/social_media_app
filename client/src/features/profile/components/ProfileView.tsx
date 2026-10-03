"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { defaultProfileData } from "../data/profile.mock";
import { ProfilePost, UserProfileData } from "../types/profile.types";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStatsBar } from "./ProfileStatsBar";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { ProfileSocialLinks } from "./ProfileSocialLinks";
import { ProfileMusicCard } from "./ProfileMusicCard";
import { ProfileFeed } from "./ProfileFeed";
import { ProfilePhotosCard } from "./ProfilePhotosCard";
import { ProfileVideosCard } from "./ProfileVideosCard";
import { useGetProfile } from "../hooks/useGetProfile";
import { formatRelativeDate } from "@/lib/date.utils";
import { FollowersModal } from "./FollowersModal";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileViewProps {
  initialData?: UserProfileData;
  userId?: string;
}

export function ProfileView({ initialData = defaultProfileData, userId }: ProfileViewProps) {
  const loggedInUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("posts");
  const [followModalType, setFollowModalType] = useState<"followers" | "following" | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalTab, setEditModalTab] = useState<"general" | "location" | "education" | "socials">("general");

  const { data: gqlProfile, isLoading } = useGetProfile(userId);

  const isSelf = gqlProfile?.isSelf ?? (!userId || userId === loggedInUser?._id);
  const currentUser = gqlProfile || (isSelf ? loggedInUser : null);

  const profilePosts: ProfilePost[] | undefined = 
     gqlProfile?.posts?.docs.map((p) => ({
        id: p._id,
        author: {
          id: currentUser?._id,
          name: `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
          avatar: currentUser?.profilePicture || "/default-avatar-profile.webp",
          date: formatRelativeDate(p.createdAt),
        },
        content: p.describtion || "",
        images: p.attachments || [],
        likes: p.likesCount ?? 0,
        comments: p.commentsCount ?? (p.comments?.length ?? 0),
        shares: 0,
        allowComments: p.allowComments !== false,
        commentsList: (p.comments as any) || [],
        isLiked: Boolean(p.isLiked),
      }));

  const locationObj = currentUser?.location || (isSelf ? loggedInUser?.location : null);
  const locationText = locationObj
    ? [locationObj.city, locationObj.governrate, locationObj.country]
        .filter(Boolean)
        .join(", ")
    : null;

  const educationObj = currentUser?.education || (isSelf ? loggedInUser?.education : null);
  const educationParts = [
    educationObj?.major,
    educationObj?.college,
    educationObj?.university,
  ].filter(Boolean);

  const educationText = educationParts.length > 0 ? educationParts.join(" • ") : null;

  const dobValue = currentUser?.DOB || (isSelf ? loggedInUser?.DOB : null);
  const birthdayText = dobValue
    ? new Date(dobValue).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;

  const userSocials = currentUser?.socialLinks?.length
    ? currentUser.socialLinks
    : isSelf && loggedInUser?.socialLinks?.length
    ? loggedInUser.socialLinks
    : [];

  const followStatus = ((gqlProfile?.followStatus || "NONE").toUpperCase() as "ACCEPTED" | "PENDING" | "NONE");
  const isPrivate = Boolean(currentUser?.isPrivate);
  const isLocked = !isSelf && isPrivate && followStatus !== "ACCEPTED";

  const profile: UserProfileData = {
    ...initialData,
    id: currentUser?._id || userId || initialData.id,
    name: currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "User Profile",
    avatar: currentUser?.profilePicture || "/default-avatar-profile.webp",
    coverImage: currentUser?.coverPicture || initialData.coverImage,
    isSelf,
    isPrivate,
    followStatus,
    info: {
      location: locationText || "",
      education: educationText || "",
      birthday: birthdayText || "",
    },
    socials: userSocials.map((s) => ({
      platform: (s.platformName || "Website") as any,
      url: s.link || "",
      iconName: "globe",
    })),
    stats: {
      followersCount: currentUser?.followersCount ?? 0,
      followingCount: currentUser?.followingCount ?? 0,
      postsCount: currentUser?.postsCount ?? (gqlProfile?.posts?.totalDocs || 0),
    },
    posts: profilePosts || [],
    photos: isLocked ? [] : initialData.photos,
    videos: isLocked ? [] : initialData.videos,
  };

  const handleOpenEdit = (tab: "general" | "location" | "education" | "socials" = "general") => {
    if (!isSelf) return;
    setEditModalTab(tab);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]/60 pb-12">
      <div className="max-w-[1400px] mx-auto px-0 sm:px-4 lg:px-6 pt-0 sm:pt-4">
        <div className="rounded-none sm:rounded-2xl overflow-hidden bg-white shadow-xs border-0 sm:border border-gray-100">
          <ProfileHeader
            profile={profile}
            onEditProfile={isSelf ? () => handleOpenEdit("general") : undefined}
            onEditCover={isSelf ? () => handleOpenEdit("general") : undefined}
            onEditAvatar={isSelf ? () => handleOpenEdit("general") : undefined}
          />
          <ProfileStatsBar
            stats={profile.stats}
            isSelf={isSelf}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenFollowModal={setFollowModalType}
            onOpenSettings={isSelf ? () => handleOpenEdit("general") : undefined}
          />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <ProfileInfoCard
              location={locationText}
              birthday={birthdayText}
              education={educationText}
              onEditSection={isSelf ? handleOpenEdit : undefined}
            />
            <ProfileSocialLinks
              socials={userSocials}
              onAddSocials={isSelf ? () => handleOpenEdit("socials") : undefined}
            />
            {!isLocked && <ProfileMusicCard tracks={profile.music} />}
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <ProfileFeed
              posts={profile.posts}
              isLoading={isLoading}
              isSelf={isSelf}
              isPrivate={isPrivate}
              followStatus={followStatus}
            />
          </div>

          <div className="lg:col-span-3 space-y-6 order-3">
            {!isLocked && (
              <>
                <ProfilePhotosCard photos={profile.photos} />
                <ProfileVideosCard videos={profile.videos} />
              </>
            )}
          </div>
        </div>
      </div>

      {isSelf && (
        <>
          <FollowersModal
            isOpen={followModalType !== null}
            onClose={() => setFollowModalType(null)}
            initialTab={followModalType || "followers"}
            followersCount={profile.stats.followersCount}
            followingCount={profile.stats.followingCount}
          />

          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            initialTab={editModalTab}
          />
        </>
      )}
    </div>
  );
}

