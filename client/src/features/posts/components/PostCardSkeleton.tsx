"use client";

interface PostCardSkeletonProps {
  hasImage?: boolean;
  className?: string;
}

export function PostCardSkeleton({
  hasImage = true,
  className = "",
}: PostCardSkeletonProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-xs border border-gray-100 animate-pulse space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-gray-200 rounded-full w-32" />
            <div className="h-2.5 bg-gray-100 rounded-full w-20" />
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-gray-100" />
      </div>

      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-5/6" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
      </div>

      {hasImage && (
        <div className="h-52 bg-gray-100 rounded-xl w-full" />
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <div className="w-8 h-3 rounded-full bg-gray-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <div className="w-8 h-3 rounded-full bg-gray-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <div className="w-8 h-3 rounded-full bg-gray-100" />
          </div>
        </div>
        <div className="w-5 h-5 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}
