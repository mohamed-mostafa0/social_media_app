export enum IStoryMediaType {
  IMAGE = "image",
  VIDEO = "video",
  VIEDO = "video", // Backwards compatibility for typo
}

export interface IStoryMedia {
  url: string;
  publicId?: string;
  mediaType: IStoryMediaType | "image" | "video";
}

export interface IStory {
  _id: string;
  media: IStoryMedia;
  caption?: string;
  viewsCount: number;
  createdAt: string;
  expiresAt: string;
  isViewed: boolean;
}

export interface IUserStoryGroup {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  isUser: boolean;
  allViewed: boolean;
  stories: IStory[];
}