"use client";

import { ProfilePost } from "../types/profile.types";
import { ProfileCreatePost } from "./ProfileCreatePost";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfileEmptyPosts } from "./ProfileEmptyPosts";

interface ProfileFeedProps {
  posts: ProfilePost[];
  isLoading?: boolean;
  onNewPost?: (content: string) => void;
}

export function ProfileFeed({ posts, isLoading = false, onNewPost }: ProfileFeedProps) {
  const handleScrollToComposer = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input[placeholder*="What\'s on your mind"], textarea[placeholder*="What\'s on your mind"]'
    );
    input?.focus();
    input?.click();
  };

  return (
    <div className="space-y-6">
      <ProfileCreatePost onPost={onNewPost} />

      {isLoading ? (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100 animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="w-28 h-3.5 bg-gray-200 rounded" />
              <div className="w-16 h-2.5 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-gray-100 rounded" />
            <div className="w-4/5 h-3 bg-gray-100 rounded" />
          </div>
          <div className="w-full h-44 bg-gray-100 rounded-xl" />
        </div>
      ) : posts.length === 0 ? (
        <ProfileEmptyPosts onActionClick={handleScrollToComposer} />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <ProfilePostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
