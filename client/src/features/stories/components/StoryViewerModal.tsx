"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiEye,
  FiVolume2,
  FiVolumeX,
  FiLoader,
  FiHeart,
  FiChevronUp,
} from "react-icons/fi";
import { IUserStoryGroup } from "../types/story.types";
import {
  useViewStory,
  useDeleteStory,
  useStoryViewers,
  useToggleStoryLike,
} from "../hooks/useStory";
import { formatRelativeDate } from "@/lib/date.utils";

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyGroups: IUserStoryGroup[];
  initialGroupIndex: number;
}

const IMAGE_STORY_DURATION = 5000;

export function StoryViewerModal({
  isOpen,
  onClose,
  storyGroups = [],
  initialGroupIndex = 0,
}: StoryViewerModalProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isViewersOpen, setIsViewersOpen] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const [likesState, setLikesState] = useState<
    Record<string, { isLiked: boolean; count: number }>
  >({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef<number>(0);

  const viewStoryMutation = useViewStory();
  const deleteStoryMutation = useDeleteStory();
  const toggleLikeMutation = useToggleStoryLike();

  useEffect(() => {
    if (isOpen) {
      setGroupIndex(
        Math.min(Math.max(initialGroupIndex, 0), Math.max(storyGroups.length - 1, 0))
      );
      setStoryIndex(0);
      setProgress(0);
      setIsPaused(false);
      setIsViewersOpen(false);
    }
  }, [isOpen, initialGroupIndex, storyGroups.length]);

  const currentGroup = storyGroups[groupIndex];
  const currentStories = currentGroup?.stories || [];
  const currentStory = currentStories[storyIndex];

  const currentIsLiked =
    likesState[currentStory?._id]?.isLiked ?? Boolean(currentStory?.isLiked);
  const currentLikesCount =
    likesState[currentStory?._id]?.count ?? (currentStory?.likesCount || 0);

  const { data: viewers = [], isLoading: isLoadingViewers } = useStoryViewers(
    currentStory?._id || "",
    isViewersOpen && Boolean(currentGroup?.isUser)
  );

  const isVideo =
    currentStory?.media?.mediaType?.toLowerCase() === "video" ||
    currentStory?.media?.url?.endsWith(".mp4") ||
    currentStory?.media?.url?.endsWith(".webm");

  useEffect(() => {
    if (!isOpen || !currentStory || !currentGroup) return;

    if (!currentGroup.isUser && !currentStory.isViewed) {
      viewStoryMutation.mutate(currentStory._id);
    }
  }, [isOpen, currentStory?._id, currentGroup?.isUser]);

  const goToNext = useCallback(() => {
    setProgress(0);
    setIsViewersOpen(false);
    if (storyIndex < currentStories.length - 1) {
      setStoryIndex((prev) => prev + 1);
    } else if (groupIndex < storyGroups.length - 1) {
      setGroupIndex((prev) => prev + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [storyIndex, currentStories.length, groupIndex, storyGroups.length, onClose]);

  const goToPrev = useCallback(() => {
    setProgress(0);
    setIsViewersOpen(false);
    if (storyIndex > 0) {
      setStoryIndex((prev) => prev - 1);
    } else if (groupIndex > 0) {
      const prevGroup = storyGroups[groupIndex - 1];
      setGroupIndex((prev) => prev - 1);
      setStoryIndex(Math.max((prevGroup?.stories.length || 1) - 1, 0));
    }
  }, [storyIndex, groupIndex, storyGroups]);

  const handleToggleLike = () => {
    if (!currentStory) return;

    const nextIsLiked = !currentIsLiked;
    const nextCount = Math.max(currentLikesCount + (nextIsLiked ? 1 : -1), 0);

    setLikesState((prev) => ({
      ...prev,
      [currentStory._id]: { isLiked: nextIsLiked, count: nextCount },
    }));

    toggleLikeMutation.mutate(currentStory._id);
  };

  const handleMediaClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!currentIsLiked) {
        handleToggleLike();
      }
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 900);
    }
    lastTapRef.current = now;
  };

  useEffect(() => {
    if (!isOpen || isPaused || isViewersOpen || isVideo || !currentStory) return;

    const intervalTime = 50;
    const step = (intervalTime / IMAGE_STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, isViewersOpen, isVideo, currentStory, goToNext]);

  useEffect(() => {
    if (!isOpen || isPaused || isViewersOpen || !isVideo || !currentStory) return;

    let animationFrameId: number;

    const syncVideoProgress = () => {
      const video = videoRef.current;
      if (video && video.duration && !isNaN(video.duration) && video.duration > 0) {
        const percent = (video.currentTime / video.duration) * 100;
        setProgress(Math.min(percent, 100));
      }
      animationFrameId = requestAnimationFrame(syncVideoProgress);
    };

    animationFrameId = requestAnimationFrame(syncVideoProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, isPaused, isViewersOpen, isVideo, currentStory]);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    if (isPaused || isViewersOpen) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  }, [isPaused, isViewersOpen, isVideo]);

  useEffect(() => {
    if (!isOpen || !isVideo) return;

    setProgress(0);
    setIsVideoLoading(true);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoLoading(false);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().catch(() => {});
            }
          });
      }
    }
  }, [groupIndex, storyIndex, isVideo, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isViewersOpen) {
          setIsViewersOpen(false);
        } else {
          onClose();
        }
      }
      if (!isViewersOpen) {
        if (e.key === "ArrowRight") goToNext();
        if (e.key === "ArrowLeft") goToPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isViewersOpen, goToNext, goToPrev, onClose]);

  const handleDeleteCurrentStory = () => {
    if (!currentStory || deleteStoryMutation.isPending) return;

    deleteStoryMutation.mutate(currentStory._id, {
      onSuccess: () => {
        if (currentStories.length <= 1) {
          if (storyGroups.length <= 1) {
            onClose();
          } else {
            goToNext();
          }
        } else {
          goToNext();
        }
      },
    });
  };

  if (!isOpen || !currentStory || !currentGroup) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md">
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-5 right-5 z-50 p-2.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        >
          <FiX className="w-6 h-6" />
        </button>

        {groupIndex > 0 && !isViewersOpen && (
          <button
            onClick={() => {
              setGroupIndex((prev) => prev - 1);
              setStoryIndex(0);
              setProgress(0);
            }}
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-40 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110 cursor-pointer"
          >
            <FiChevronLeft className="w-7 h-7" />
          </button>
        )}

        {groupIndex < storyGroups.length - 1 && !isViewersOpen && (
          <button
            onClick={() => {
              setGroupIndex((prev) => prev + 1);
              setStoryIndex(0);
              setProgress(0);
            }}
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-40 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110 cursor-pointer"
          >
            <FiChevronRight className="w-7 h-7" />
          </button>
        )}

        <motion.div
          key={`${groupIndex}-${storyIndex}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          onPointerDown={() => {
            if (!isViewersOpen) setIsPaused(true);
          }}
          onPointerUp={() => setIsPaused(false)}
          onPointerLeave={() => setIsPaused(false)}
          className="relative w-full max-w-sm sm:max-w-md h-[92vh] max-h-[820px] bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none"
        >
          <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <div className="flex gap-1.5 w-full mb-3">
              {currentStories.map((s, idx) => {
                let barWidth = "0%";
                if (idx < storyIndex) barWidth = "100%";
                else if (idx === storyIndex) barWidth = `${progress}%`;

                return (
                  <div
                    key={s._id || idx}
                    className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-white rounded-full transition-[width] duration-75 ease-linear"
                      style={{ width: barWidth }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/40 bg-neutral-800">
                  <img
                    src={
                      currentGroup.user.profilePicture ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                    }
                    alt={currentGroup.user.firstName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-semibold leading-tight drop-shadow-sm">
                    {currentGroup.isUser
                      ? "Your Story"
                      : `${currentGroup.user.firstName} ${currentGroup.user.lastName}`}
                  </h4>
                  <span className="text-[11px] text-white/70 drop-shadow-sm">
                    {formatRelativeDate(currentStory.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted((prev) => !prev);
                    }}
                    className="p-1.5 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <FiVolumeX className="w-4 h-4" />
                    ) : (
                      <FiVolume2 className="w-4 h-4" />
                    )}
                  </button>
                )}

                {currentGroup.isUser && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsViewersOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-xs text-white/90 bg-black/40 hover:bg-black/60 px-2.5 py-1.5 rounded-full backdrop-blur-sm cursor-pointer transition-colors"
                    title="Story Viewers"
                  >
                    <FiEye className="w-3.5 h-3.5" />
                    <span>{currentStory.viewsCount || 0}</span>
                  </button>
                )}

                {currentGroup.isUser && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCurrentStory();
                    }}
                    disabled={deleteStoryMutation.isPending}
                    className="p-1.5 text-white/80 hover:text-red-400 bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
                    title="Delete Story"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div
            className="relative w-full h-full flex items-center justify-center bg-black"
            onClick={handleMediaClick}
          >
            {isVideo ? (
              <>
                <video
                  ref={videoRef}
                  key={currentStory.media.url}
                  src={currentStory.media.url}
                  autoPlay
                  playsInline
                  loop={false}
                  muted={isMuted}
                  className="w-full h-full object-contain"
                  onWaiting={() => setIsVideoLoading(true)}
                  onPlaying={() => setIsVideoLoading(false)}
                  onCanPlay={() => setIsVideoLoading(false)}
                  onEnded={goToNext}
                />

                {isVideoLoading && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="p-3 bg-black/60 rounded-full backdrop-blur-sm text-white">
                      <FiLoader className="w-6 h-6 animate-spin" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img
                src={currentStory.media.url}
                alt={currentStory.caption || "Story"}
                className="w-full h-full object-contain"
              />
            )}

            <AnimatePresence>
              {showHeartPop && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.3, opacity: 1 }}
                  exit={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute pointer-events-none z-30"
                >
                  <FiHeart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-2xl" />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
            />
            <div
              className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            />
          </div>

          <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2.5">
            {currentStory.caption && (
              <p className="text-white text-sm text-center font-medium drop-shadow-md px-2 line-clamp-2">
                {currentStory.caption}
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              {currentGroup.isUser ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsViewersOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-md transition-all cursor-pointer hover:scale-105"
                >
                  <FiChevronUp className="w-4 h-4" />
                  <span>Activity ({currentStory.viewsCount || 0})</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <FiHeart
                    className={`w-4 h-4 transition-colors ${
                      currentIsLiked
                        ? "fill-rose-500 text-rose-500"
                        : "text-white"
                    }`}
                  />
                  <span>{currentLikesCount}</span>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isViewersOpen && currentGroup.isUser && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 280 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-x-0 bottom-0 z-40 max-h-[70%] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden text-gray-900"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-gray-900">Viewers</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {viewers.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsViewersOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoadingViewers ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                      <FiLoader className="w-6 h-6 animate-spin text-purple-600 mb-2" />
                      <p className="text-xs">Loading viewers...</p>
                    </div>
                  ) : viewers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <FiEye className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium text-gray-600">No viewers yet</p>
                      <p className="text-xs text-gray-400 mt-1">
                        When people watch your story, they'll appear here.
                      </p>
                    </div>
                  ) : (
                    viewers.map((viewer) => (
                      <div
                        key={viewer._id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex-shrink-0">
                            <img
                              src={
                                viewer.user?.profilePicture ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                              }
                              alt={viewer.user?.firstName || "Viewer"}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">
                              {viewer.user?.firstName} {viewer.user?.lastName}
                            </p>
                            <span className="text-[11px] text-gray-400">
                              {formatRelativeDate(viewer.viewedAt)}
                            </span>
                          </div>
                        </div>

                        {viewer.hasLiked && (
                          <div
                            className="p-1 text-rose-500"
                            title="Liked your story"
                          >
                            <FiHeart className="w-4 h-4 fill-rose-500 text-rose-500" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
