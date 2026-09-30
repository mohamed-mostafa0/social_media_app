export interface CommentAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface CommentAttachment {
  url: string;
  publicId?: string;
}

export interface CommentItem {
  _id: string;
  content: string;
  likesCount?: number;
  repliesCount?: number;
  createdAt?: string;
  attachment?: CommentAttachment;
  ownerId: CommentAuthor;
  parentCommentId?: string | { _id: string } | null;
  replies?: CommentItem[];
  isLiked?: boolean;
}

export interface CreateCommentPayload {
  parentCommentId?: string;
  content?: string;
  attachment?: File | null;
}

export interface editCommentPayload {
  content?: string;
  removeAttachment?: boolean;
  attachment?: File | null;
}

export type EditCommentPayload = editCommentPayload;