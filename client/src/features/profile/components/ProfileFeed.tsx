import { FiLock } from "react-icons/fi";
import { ProfilePost } from "../types/profile.types";
import { ProfileCreatePost } from "./ProfileCreatePost";
import { ProfilePostCard } from "./ProfilePostCard";
import { ProfileEmptyPosts } from "./ProfileEmptyPosts";

interface ProfileFeedProps {
  posts: ProfilePost[];
  isLoading?: boolean;
  onNewPost?: (content: string) => void;
  isSelf?: boolean;
  isPrivate?: boolean;
  followStatus?: "ACCEPTED" | "PENDING" | "NONE";
}

export function ProfileFeed({
  posts,
  isLoading = false,
  onNewPost,
  isSelf = true,
  isPrivate = false,
  followStatus = "NONE",
}: ProfileFeedProps) {
  const isPrivateAndLocked = !isSelf && isPrivate && followStatus?.toUpperCase() !== "ACCEPTED";

  const handleScrollToComposer = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const input = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      'input[placeholder*="What\'s on your mind"], textarea[placeholder*="What\'s on your mind"]'
    );
    input?.focus();
    input?.click();
  };

  if (isPrivateAndLocked) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-xs border border-gray-100 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          <FiLock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-1">This Account is Private</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Follow this account to see their photos, videos, and posts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSelf && <ProfileCreatePost onPost={onNewPost} />}

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
        <ProfileEmptyPosts onActionClick={isSelf ? handleScrollToComposer : undefined} />
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

