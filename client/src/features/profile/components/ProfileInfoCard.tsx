"use client";

import { FiMapPin, FiCalendar, FiBookOpen, FiEdit2, FiPlus } from "react-icons/fi";
import { ProfileInfo } from "../types/profile.types";

interface ProfileInfoCardProps {
  info?: Partial<ProfileInfo>;
  location?: string | null;
  birthday?: string | null;
  education?: string | null;
  onEditSection?: (section: "location" | "education" | "general") => void;
}

export function ProfileInfoCard({
  info,
  location: directLocation,
  birthday: directBirthday,
  education: directEducation,
  onEditSection,
}: ProfileInfoCardProps) {
  const location = directLocation !== undefined ? directLocation : info?.location;
  const birthday = directBirthday !== undefined ? directBirthday : info?.birthday;
  const education = directEducation !== undefined ? directEducation : info?.education;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
          About
        </h3>
        {onEditSection && (
          <button
            onClick={() => onEditSection("general")}
            type="button"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3.5 text-gray-700 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                location ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              <FiMapPin className="w-4 h-4" />
            </div>
            {location ? (
              <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                {location}
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-gray-400 italic">
                No location added
              </span>
            )}
          </div>
          {!location && onEditSection && (
            <button
              onClick={() => onEditSection("location")}
              type="button"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            >
              <FiPlus className="w-3 h-3" />
              <span>Add</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3.5 text-gray-700 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                birthday ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              <FiCalendar className="w-4 h-4" />
            </div>
            {birthday ? (
              <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                {birthday}
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-gray-400 italic">
                No birthday added
              </span>
            )}
          </div>
          {!birthday && onEditSection && (
            <button
              onClick={() => onEditSection("general")}
              type="button"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            >
              <FiPlus className="w-3 h-3" />
              <span>Add</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3.5 text-gray-700 min-w-0">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                education ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-400"
              }`}
            >
              <FiBookOpen className="w-4 h-4" />
            </div>
            {education ? (
              <span className="text-xs sm:text-sm font-medium text-gray-800 leading-snug">
                {education}
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-gray-400 italic">
                No education added
              </span>
            )}
          </div>
          {!education && onEditSection && (
            <button
              onClick={() => onEditSection("education")}
              type="button"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            >
              <FiPlus className="w-3 h-3" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

