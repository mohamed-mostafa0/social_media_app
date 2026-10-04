"use client";

import { useRef, useEffect } from "react";
import { useInView } from "framer-motion";

import { Stories } from "@/features/stories/components/Stories";
import { ProfileCreatePost } from "@/features/profile";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import { FiChevronDown, FiAlertCircle, FiInbox } from "react-icons/fi";
import { useMainFeed } from "../hooks/usePost";

export function MainFeed() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMainFeed(10);

  const bottomRef = useRef<HTMLDivElement>(null);
  const isBottomInView = useInView(bottomRef, {
    margin: "300px",
  });

  useEffect(() => {
    if (isBottomInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isBottomInView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page?.docs || []) || [];


  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Stories />
      <ProfileCreatePost />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800">News Feed</h2>
        <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
          Sort by: <span className="text-gray-900">Latest</span>
          <FiChevronDown className="w-4 h-4 ml-0.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <PostCardSkeleton hasImage={true} />
          <PostCardSkeleton hasImage={false} />
          <PostCardSkeleton hasImage={true} />
        </div>
      ) : isError ? (
        <div className="bg-white rounded-2xl p-8 border border-red-100 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Failed to load feed</h3>
          <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
            {(error as Error)?.message || "Something went wrong while fetching your feed."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            Try Again
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3">
            <FiInbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Your feed is empty</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            There are no posts from other users yet. Be the first to share an update or follow other creators!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const authorName = post.owner
              ? `${post.owner.firstName || ""} ${post.owner.lastName || ""}`.trim() ||
                "Anonymous"
              : "Anonymous";

            return (
              <PostCard
                key={post._id}
                id={post._id}
                authorId={post.owner?._id}
                author={{
                  name: authorName,
                  avatar: post.owner?.profilePicture || "/default-avatar-profile.webp",
                  date: post.createdAt || "",
                }}
                content={post.describtion || ""}
                images={post.attachments || []}
                tags={
                  post.tags
                    ? post.tags.map((t) =>
                        typeof t === "string"
                          ? t
                          : `${t.firstName || ""} ${t.lastName || ""}`.trim()
                      )
                    : []
                }
                likes={post.likesCount || 0}
                comments={post.commentsCount || 0}
                allowComments={post.allowComments !== false}
                commentsList={(post.comments as any) || []}
                isLiked={Boolean(post.isLiked)}
              />
            );
          })}

          {isFetchingNextPage && (
            <div className="space-y-6">
              <PostCardSkeleton hasImage={true} />
            </div>
          )}

          <div ref={bottomRef} className="py-6 flex justify-center items-center">
            {!hasNextPage && posts.length > 0 ? (
              <p className="text-xs text-gray-400 font-medium select-none">
                You&apos;ve caught up with all posts! 
              </p>
            ) : null}
          </div>
        </div>
      )}

    </main>
  );
}

