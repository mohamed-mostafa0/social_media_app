"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiUsers, FiEdit3, FiUser } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useFollowRequests } from "@/features/profile";

export function MobileBottomNav() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuth = useAuthStore((state) => state.isAuth);
  const { data: requests = [] } = useFollowRequests();

  const handleCreatePostClick = () => {
    if (pathname === "/") {
      const input = document.querySelector<HTMLInputElement>(
        'input[placeholder^="What\'s on your mind"]'
      );
      if (input) {
        input.click();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
  };

  const navItems = [
    {
      name: "Feed",
      href: "/",
      icon: FiHome,
      isActive: pathname === "/",
    },
    {
      name: "Friends",
      href: "/friends",
      icon: FiUsers,
      isActive: pathname === "/friends",
      badge: requests.length > 0 ? requests.length : null,
    },
    {
      name: "Post",
      action: handleCreatePostClick,
      icon: FiEdit3,
      isAction: true,
    },
    {
      name: "Profile",
      href: user ? `/profile/${user._id}` : "/profile",
      isProfile: true,
      isActive: pathname.startsWith("/profile"),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-3 py-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={item.action}
                className="flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-blue-600 transition-colors group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-active:scale-95 transition-transform">
                  <FiEdit3 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium text-gray-500 mt-0.5">
                  {item.name}
                </span>
              </button>
            );
          }

          if (item.isProfile) {
            return (
              <Link
                key={item.name}
                href={item.href!}
                className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
                  item.isActive ? "text-blue-600 font-semibold" : "text-gray-500"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full overflow-hidden transition-all ${
                    item.isActive
                      ? "ring-2 ring-blue-600 ring-offset-1"
                      : "opacity-80"
                  }`}
                >
                  {isAuth && user ? (
                    <Avatar
                      size="sm"
                      src={user.profilePicture || "/default-avatar-profile.webp"}
                      alt={user.firstName}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <FiUser className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
              </Link>
            );
          }

          const Icon = item.icon!;
          return (
            <Link
              key={item.name}
              href={item.href!}
              className={`flex flex-col items-center justify-center p-1.5 relative transition-colors ${
                item.isActive
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.isActive ? "scale-110" : ""
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
