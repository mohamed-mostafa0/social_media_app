"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useChatStore } from "@/features/chat";
import { RightSidebar } from "./RightSidebar";

export function ConversationsDrawer() {
  const isConversationsOpen = useChatStore((state) => state.isConversationsOpen);
  const closeConversations = useChatStore((state) => state.closeConversations);

  return (
    <AnimatePresence>
      {isConversationsOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeConversations}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white shadow-2xl z-10 flex flex-col overflow-hidden"
          >
            <RightSidebar isDrawer onClose={closeConversations} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
