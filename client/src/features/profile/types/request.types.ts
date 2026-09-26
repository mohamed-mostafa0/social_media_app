export interface FollowRequester {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
}

export interface FollowRequestItem {
  _id: string;
  followFromId: FollowRequester;
  followToId: string;
  status: "pending" | "accepted";
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowRelationItem {
  _id: string;
  followFromId: FollowRequester | string;
  followToId: FollowRequester | string;
  status: "pending" | "accepted" | "rejected";
  isFollowing?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
