export interface UserLocation {
  country?: string;
  city?: string;
  governrate?: string;
  street?: string;
}

export interface UserEducation {
  university?: string;
  college?: string;
  major?: string;
  graduationYear?: number;
}

export interface UserSocialLink {
  platformName?: string;
  link?: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: 'male' | 'female';
  phoneNumber?: string;
  DOB?: string;
  location?: UserLocation;
  education?: UserEducation;
  socialLinks?: UserSocialLink[];
  avatar?: string;
  profilePicture?: string;
  coverPicture?: string;
  handle?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isVerified?: boolean;
  isPrivate?: boolean;
}


export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female';
  phoneNumber?: string;
  DOB?: string;
  location?: UserLocation;
  education?: UserEducation;
  socialLinks?: UserSocialLink[];
}

