"use client";

import {
  FaInstagram,
  FaDribbble,
  FaBehance,
  FaLinkedinIn,
  FaGithub,
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaTiktok,
} from "react-icons/fa";
import { FiGlobe, FiPlus, FiShare2, FiEdit2 } from "react-icons/fi";
import { UserSocialLink } from "@/types/user.types";

interface ProfileSocialLinksProps {
  socials?: (UserSocialLink | { platform?: string; url?: string })[];
  onAddSocials?: () => void;
}

export function ProfileSocialLinks({ socials = [], onAddSocials }: ProfileSocialLinksProps) {
  const normalizedLinks = socials
    .map((s: any) => ({
      platform: s.platformName || "Website",
      url: s.link || "",
    }))
    .filter((s) => Boolean(s.url));

  const getIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes("instagram")) return <FaInstagram className="w-4 h-4 text-pink-500" />;
    if (p.includes("linkedin")) return <FaLinkedinIn className="w-4 h-4 text-blue-700" />;
    if (p.includes("github")) return <FaGithub className="w-4 h-4 text-gray-900" />;
    if (p.includes("facebook")) return <FaFacebookF className="w-4 h-4 text-blue-600" />;
    if (p.includes("twitter") || p.includes("x")) return <FaTwitter className="w-4 h-4 text-sky-500" />;
    if (p.includes("youtube")) return <FaYoutube className="w-4 h-4 text-red-600" />;
    if (p.includes("dribbble")) return <FaDribbble className="w-4 h-4 text-rose-500" />;
    if (p.includes("behance")) return <FaBehance className="w-4 h-4 text-blue-600" />;
    if (p.includes("tiktok")) return <FaTiktok className="w-4 h-4 text-gray-900" />;
    return <FiGlobe className="w-4 h-4 text-teal-600" />;
  };

  if (normalizedLinks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-50">
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
            Social Links
          </h3>
          {onAddSocials && (
            <button
              onClick={onAddSocials}
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}
        </div>

        <div className="py-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
            <FiShare2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-gray-700">No social links added</p>
          <p className="text-[11px] text-gray-400 mt-0.5 max-w-[200px]">
            Connect your profiles to share your social presence
          </p>
          {onAddSocials && (
            <button
              onClick={onAddSocials}
              type="button"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5" />
              <span>Add Social Links</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-100">
      <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-gray-50">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
          Social Links
        </h3>
        {onAddSocials && (
          <button
            onClick={onAddSocials}
            type="button"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FiEdit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {normalizedLinks.map((link, idx) => {
          const href = link.url.startsWith("http") ? link.url : `https://${link.url}`;
          return (
            <a
              key={idx}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors group cursor-pointer"
            >
              <div className="w-5 h-5 flex items-center justify-center transition-transform group-hover:scale-110 shrink-0">
                {getIcon(link.platform)}
              </div>
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors truncate">
                {link.platform}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
