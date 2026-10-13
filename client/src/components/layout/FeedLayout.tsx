"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopNavbar } from "./TopNavbar";
import { MobileBottomNav } from "./MobileBottomNav";
import { ConversationsDrawer } from "./ConversationsDrawer";
import { ChatWidget } from "@/features/chat";
import { useAuthStore } from "@/features/auth/stores/auth.store";

interface FeedLayoutProps {
  children: React.ReactNode;
}

export function FeedLayout({ children }: FeedLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuth = useAuthStore((state) => state.isAuth);
  const isProfilePage = pathname.startsWith("/profile");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuth) {
      const fromParam = pathname !== "/" ? `?from=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${fromParam}`);
    }
  }, [hasHydrated, isAuth, pathname, router]);

  if (!hasHydrated || !isAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-gray-500">Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNavbar />
      
      {isProfilePage ? (
        <main className="flex-1 w-full">{children}</main>
      ) : (
        <div className="max-w-[1600px] w-full mx-auto flex-1 flex">
          <div className="hidden lg:block flex-shrink-0">
            <LeftSidebar />
          </div>

          <div className="flex-1 min-w-0 overflow-y-auto relative pb-16 lg:pb-0">
            {children}
          </div>

          <div className="hidden xl:block flex-shrink-0">
            <RightSidebar />
          </div>
        </div>
      )}

      <ChatWidget />
      <MobileBottomNav />
      <ConversationsDrawer />
    </div>
  );
}

