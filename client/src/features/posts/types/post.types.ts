export interface PostAuthor {
  name: string;
  avatar: string;
  date?: string;
  handle?: string;
}

export interface Post {
  id: string | number;
  author: PostAuthor;
  content: string;
  tags: string[];
  images: string[];
  likes: string | number;
  comments: string | number;
  shares?: string | number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface CreatePostPayload {
  describtion: string;
  attachments?: string[];
  tags?: string[];
  allowComments?: boolean;
  ownerId?: string;
}

export interface EditPostPayload {
  describtion?: string;
  allowComments?: boolean;
  removeAttachments?: boolean | string[];
  images?: File[];
}


