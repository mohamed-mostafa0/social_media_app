"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";
import { FiCheck, FiX, FiUserPlus, FiClock } from "react-icons/fi";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useFollowRequests, useRespondToFollowRequest } from "../hooks/useFollowRequests";

interface FollowRequestsListProps {
  compact?: boolean;
}

export function FollowRequestsList({ compact = false }: FollowRequestsListProps) {
  const isAuth = useAuthStore((state) => state.isAuth);
  const { data: requests = [], isLoading, error, refetch } = useFollowRequests();
  const respondMutation = useRespondToFollowRequest();

  if (!isAuth) {
    return (
      <div className="text-center py-8 px-4 text-xs text-gray-500">
        Please sign in to view follow requests.
      </div>
    );
  }

  if (isLoading && requests.length === 0) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/70 animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-28 bg-gray-200 rounded" />
              <div className="h-2.5 w-16 bg-gray-100 rounded" />
            </div>
            <div className="flex gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
              <div className="w-8 h-8 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && requests.length === 0) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to load requests";
    return (
      <div className="p-4 text-center">
        <p className="text-xs text-red-500 mb-2">{errorMsg}</p>
        <button
          onClick={() => refetch()}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="py-8 px-4 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
          <FiUserPlus className="w-5 h-5" />
        </div>
        <p className="text-xs font-bold text-gray-800">No pending requests</p>
        <p className="text-[11px] text-gray-400 mt-1 max-w-[180px]">
          When people ask to follow you, their requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {requests.map((request) => {
          const requester = request.followFromId;
          if (!requester) return null;

          const fullName =
            `${requester.firstName || ""} ${requester.lastName || ""}`.trim() ||
            "User";

          const isCurrentItem =
            respondMutation.variables?.followFromId === requester._id &&
            respondMutation.isPending;
          const isAccepting =
            isCurrentItem && respondMutation.variables?.response === "accept";
          const isRejecting =
            isCurrentItem && respondMutation.variables?.response === "reject";
          const isBusy = respondMutation.isPending;

          return (
            <motion.div
              key={request._id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.9,
                x: -20,
                transition: { duration: 0.2 },
              }}
              className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${
                compact
                  ? "bg-gray-50/70 hover:bg-gray-100/80 border border-gray-100/80"
                  : "bg-white hover:shadow-md border border-gray-100 p-4"
              }`}
            >
              <Link
                href={`/profile/${requester._id}`}
                className="flex items-center gap-3 min-w-0 group cursor-pointer"
              >
                <Avatar
                  size={compact ? "sm" : "md"}
                  src={requester.profilePicture}
                  alt={fullName}
                  className="ring-2 ring-white shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {fullName}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                    <FiClock className="w-2.5 h-2.5 shrink-0" />
                    Requested to follow you
                  </p>
                </div>
              </Link>


              <div className="flex items-center gap-1.5 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  disabled={isBusy}
                  onClick={() =>
                    respondMutation.mutate({
                      followFromId: requester._id,
                      response: "accept",
                    })
                  }
                  title="Confirm request"
                  className={`flex items-center justify-center gap-1 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
                    compact
                      ? "w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                      : "px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-xs"
                  } ${isBusy ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isAccepting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                      {!compact && <span>Confirm</span>}
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.92 }}
                  disabled={isBusy}
                  onClick={() =>
                    respondMutation.mutate({
                      followFromId: requester._id,
                      response: "reject",
                    })
                  }
                  title="Delete request"
                  className={`flex items-center justify-center gap-1 rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer ${
                    compact
                      ? "w-7 h-7 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600"
                      : "px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs"
                  } ${isBusy ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {isRejecting ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiX className="w-3.5 h-3.5 stroke-[2.5]" />
                      {!compact && <span>Delete</span>}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
