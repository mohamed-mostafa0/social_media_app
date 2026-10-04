"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiSend, FiMaximize2 } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { useChat } from "../hooks/useChat";
import { formatMessageTime, formatMessageDate, isDifferentDay } from "../utils/chatDate.utils";

export function ChatWidget() {
  const {
    isOpen,
    isMinimized,
    activeUser,
    messages,
    loggedInUser,
    closeChat,
    toggleMinimize,
    sendPrivateMessage,
    isConnected,
  } = useChat();

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized, isOpen]);

  if (!isOpen || !activeUser) return null;

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const sent = sendPrivateMessage(inputText);
    if (sent) {
      setInputText("");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <Avatar
                size="sm"
                src={activeUser.avatar || "/default-avatar-profile.webp"}
                alt={activeUser.name}
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  activeUser.isOnline !== false ? "bg-emerald-400" : "bg-gray-400"
                }`}
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold truncate">
                {activeUser.name}
              </h4>
              <p className="text-[10px] text-blue-100 flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? "bg-emerald-400" : "bg-red-400"
                  }`}
                />
                {isConnected ? "Connected" : "Reconnecting..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMinimize}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? (
                <FiMaximize2 className="w-3.5 h-3.5" />
              ) : (
                <FiMinus className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={closeChat}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
              title="Close chat"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="h-72 overflow-y-auto p-4 space-y-2 bg-[#F8FAFC] flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                    💬
                  </div>
                  <p className="text-xs font-semibold text-gray-700">
                    No messages yet
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Say hello to {activeUser.name}!
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMine =
                    Boolean(loggedInUser?._id) &&
                    String(msg.senderId) === String(loggedInUser?._id);

                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const showDateSeparator =
                    index === 0 || isDifferentDay(prevMsg?.createdAt, msg.createdAt);

                  return (
                    <div key={msg._id || index} className="space-y-2">
                      {showDateSeparator && (
                        <div className="flex items-center justify-center my-2 select-none">
                          <span className="px-3 py-0.5 bg-white border border-gray-200/90 text-gray-500 rounded-full text-[10px] font-semibold shadow-2xs">
                            {formatMessageDate(msg.createdAt)}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-xs ${
                            isMine
                              ? "bg-blue-600 text-white rounded-br-xs"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div
                            className={`text-[9.5px] mt-0 ml-10 flex items-center justify-end select-none font-medium ${
                              isMine ? "text-blue-100/90" : "text-gray-400"
                            }`}
                          >
                            <span>{formatMessageTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>


            <form
              onSubmit={handleSend}
              className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeUser.name}...`}
                disabled={!isConnected}
                className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || !isConnected}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                <FiSend className="w-3.5 h-3.5" />
              </button>
            </form>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
