export interface ProfileStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface ProfileInfo {
  location: string;
  birthday: string;
  education: string;
}

export interface SocialLink {
  platform: "Instagram" | "Dribbble" | "Behance" | "LinkedIn";
  url: string;
  iconName: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  duration?: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration?: string;
  views?: string;
}

import { CommentItem } from "@/features/posts/types/comment.types";

export interface ProfilePost {
  id: string;
  author: {
    id?: string;
    name: string;
    avatar: string;
    date: string;
  };
  content?: string;
  tags?: string[];
  location?: string;
  images: string[];
  likes: number | string;
  comments: number | string;
  shares?: number | string;
  allowComments?: boolean;
  commentsList?: CommentItem[];
  isLiked?: boolean;
}

export interface UserProfileData {
  id: string;
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  stats: ProfileStats;
  info: ProfileInfo;
  socials: SocialLink[];
  music: MusicTrack[];
  photos: PhotoItem[];
  videos: VideoItem[];
  posts: ProfilePost[];
  isSelf?: boolean;
  followStatus?: "ACCEPTED" | "PENDING" | "NONE";
  isPrivate?: boolean;
}

