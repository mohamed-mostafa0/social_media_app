"use client";

import { motion } from "framer-motion";
import { Avatar } from "../ui/Avatar";
import { FiEdit, FiSearch, FiMessageSquare } from "react-icons/fi";
import { useState } from "react";
import { FollowRequestsList, useFollowRequests } from "@/features/profile";
import { useChatStore, useConversations, formatMessageTime } from "@/features/chat";



export function RightSidebar() {
  const [activeTab, setActiveTab] = useState("Primary");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: requests = [] } = useFollowRequests();
  const { data: conversations = [], isLoading: isConversationsLoading } = useConversations();
  const openChat = useChatStore((state) => state.openChat);

  const filteredConversations = conversations.filter((c) =>
    c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-80 h-[calc(100vh-65px)] sticky top-[65px] flex flex-col pt-6 pb-4 pl-6 overflow-y-auto scrollbar-hide">
      
      <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">
            {activeTab === "Requests" ? "Follow Requests" : "Messages"}
          </h3>
          <button className="text-gray-400 hover:text-gray-900 transition-colors">
            <FiEdit className="w-4 h-4" />
          </button>
        </div>

        {activeTab !== "Requests" && (
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent rounded-xl text-xs placeholder-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 transition-colors outline-none"
              placeholder="Search conversations..."
            />
          </div>
        )}

        <div className="flex gap-4 border-b border-gray-100 mb-4 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab("Primary")}
            className={`pb-2 transition-colors relative ${activeTab === "Primary" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
          >
            Primary
            {activeTab === "Primary" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
          </button>
          <button 
            onClick={() => setActiveTab("General")}
            className={`pb-2 transition-colors relative ${activeTab === "General" ? "text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
          >
            General
            {activeTab === "General" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
          </button>
          <button 
            onClick={() => setActiveTab("Requests")}
            className={`pb-2 transition-colors relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === "Requests" ? "text-blue-600 font-bold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span>Requests</span>
            {requests.length > 0 && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">
                {requests.length}
              </span>
            )}
            {activeTab === "Requests" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
          {activeTab === "Requests" ? (
            <FollowRequestsList compact />
          ) : isConversationsLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3 p-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-2 bg-gray-100 rounded w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2.5">
                <FiMessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-700">
                {searchQuery ? "No matches found" : "No messages yet"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                {searchQuery
                  ? `No conversations match "${searchQuery}"`
                  : 'Click "Message" on any user\'s profile to start chatting!'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv, i) => (
              <motion.div 
                key={conv._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() =>
                  openChat({
                    id: conv.otherUser._id,
                    name: conv.otherUser.name,
                    avatar: conv.otherUser.avatar || undefined,
                    isOnline: conv.otherUser.isOnline,
                  })
                }
                className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-xl transition-colors"
              >
                <div className="shrink-0">
                  <Avatar
                    size="sm"
                    src={conv.otherUser.avatar || undefined}
                    online={conv.otherUser.isOnline}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                      {conv.otherUser.name}
                    </p>
                    {conv.updatedAt && (
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatMessageTime(conv.updatedAt)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {conv.lastMessage.text}
                    </p>
                  )}
                </div>
              </motion.div>
            ))

          )}
        </div>
        
        {activeTab !== "Requests" && filteredConversations.length > 5 && (
          <button className="text-xs font-semibold text-gray-500 mt-4 text-left hover:text-gray-800 transition-colors pt-2 border-t border-gray-50">
            View All
          </button>
        )}
      </div>
    </aside>
  );
}

