"use client";

import { FiCamera, FiPlus, FiEdit2 } from "react-icons/fi";
import { UserProfileData } from "../types/profile.types";

interface ProfileHeaderProps {
  profile: UserProfileData;
  onEditCover?: () => void;
  onEditAvatar?: () => void;
  onEditProfile?: () => void;
}

export function ProfileHeader({ profile, onEditCover, onEditAvatar, onEditProfile }: ProfileHeaderProps) {
  return (
    <div className="relative bg-white rounded-b-2xl shadow-xs overflow-hidden">
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full overflow-hidden bg-gradient-to-r from-teal-800 to-cyan-700">
        <img
          src={profile.coverImage}
          alt="Cover banner"
          className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2.5">
          {onEditProfile && (
            <button
              onClick={onEditProfile}
              type="button"
              className="p-2.5 sm:px-3.5 sm:py-2 bg-white/90 hover:bg-white text-gray-800 rounded-full sm:rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl backdrop-blur-md"
            >
              <FiEdit2 className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
          )}

          <button
            onClick={onEditCover}
            type="button"
            aria-label="Change cover photo"
            className="p-2.5 sm:px-3.5 sm:py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full sm:rounded-xl text-xs font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer border border-white/20 shadow-lg"
          >
            <FiCamera className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Edit Cover</span>
          </button>
        </div>

        <div className="absolute bottom-4 left-6 sm:left-10 flex items-end gap-4 sm:gap-6 z-10">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-rose-200">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <button
              onClick={onEditAvatar}
              type="button"
              aria-label="Upload photo"
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center ring-2 ring-white shadow-md cursor-pointer transition-transform hover:scale-110"
            >
              <FiPlus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <div className="mb-2 sm:mb-4 text-white drop-shadow-md">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
              {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 font-medium mt-0.5">
              {profile.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
