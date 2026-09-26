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

interface ProfileViewProps {
  initialData?: UserProfileData;
}

export function ProfileView({ initialData = defaultProfileData }: ProfileViewProps) {
  const loggedInUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("posts");

  const { data: gqlProfile, isLoading } = useGetProfile();
  console.log("gqlProfile", gqlProfile);
  

  const currentUser = gqlProfile || loggedInUser;

  const profilePosts: ProfilePost[] = gqlProfile?.posts?.docs
    ? gqlProfile.posts.docs.map((p) => ({
        id: p._id,
        author: {
          name: `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
          avatar: currentUser?.profilePicture || "/default-avatar-profile.webp",
          date: formatRelativeDate(p.createdAt),
        },
        content: p.describtion || "",
        images: p.attachments || [],
        likes:  0,
        comments: p.commentsCount ?? 0,
        shares: 0,
      }))
    : (!gqlProfile && !isLoading ? initialData.posts : []);

  const profile: UserProfileData = {
    ...initialData,
    name: currentUser? `${currentUser.firstName} ${currentUser.lastName}`.trim():"",
    avatar: currentUser?.profilePicture || "/default-avatar-profile.webp",
    coverImage: currentUser?.coverPicture || initialData.coverImage,
    stats: {
      followersCount: currentUser?.followersCount ?? 0,
      followingCount: currentUser?.followingCount ?? 0,
      postsCount: currentUser?.postsCount ?? (gqlProfile?.posts?.totalDocs || 0),
    },
    posts: profilePosts,
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]/60 pb-12">
      <div className="max-w-[1400px] mx-auto px-0 sm:px-4 lg:px-6 pt-0 sm:pt-4">
        <div className="rounded-none sm:rounded-2xl overflow-hidden bg-white shadow-xs border-0 sm:border border-gray-100">
          <ProfileHeader profile={profile} />
          <ProfileStatsBar
            stats={profile.stats}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
            <ProfileInfoCard info={profile.info} />
            <ProfileSocialLinks socials={profile.socials} />
            <ProfileMusicCard tracks={profile.music} />
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <ProfileFeed posts={profile.posts} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-3 space-y-6 order-3">
            <ProfilePhotosCard photos={profile.photos} />
            <ProfileVideosCard videos={profile.videos} />
          </div>
        </div>
      </div>
    </div>
  );
}
