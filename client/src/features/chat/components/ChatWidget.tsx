"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiSend, FiMaximize2, FiMinimize2, FiMic, FiTrash2 } from "react-icons/fi";
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5";
import { Avatar } from "@/components/ui/Avatar";
import { useChat } from "../hooks/useChat";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { VoiceNotePlayer } from "./VoiceNotePlayer";
import { chatService } from "../api/chat.service";
import { formatMessageTime, formatMessageDate, isDifferentDay } from "../utils/chatDate.utils";

export function ChatWidget() {
  const {
    isOpen,
    isMinimized,
    activeUser,
    messages,
    loggedInUser,
    isOtherUserTyping,
    emitTyping,
    closeChat,
    toggleMinimize,
    sendPrivateMessage,
    isConnected,
  } = useChat();

  const [inputText, setInputText] = useState("");
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized, isOpen, isOtherUserTyping]);

  useEffect(() => {
    return () => {
      cancelRecording();
    };
  }, [activeUser?.id, isOpen, cancelRecording]);

  if (!isOpen || !activeUser) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    emitTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    emitTyping(false);

    const sent = sendPrivateMessage(inputText);
    if (sent) {
      setInputText("");
    }
  };

  const handleStartRecord = async () => {
    if (!isConnected) return;
    const started = await startRecording();
    if (!started) {
      alert("Microphone permission denied or microphone not found.");
    }
  };

  const handleSendVoice = async () => {
    if (isUploadingVoice) return;
    try {
      setIsUploadingVoice(true);
      const result = await stopRecording();
      if (!result || !result.blob) {
        setIsUploadingVoice(false);
        return;
      }

      if (result.duration < 1 && result.blob.size < 100) {
        setIsUploadingVoice(false);
        return;
      }

      await chatService.sendVoiceNote(activeUser.id, result.blob, result.duration);
    } catch (error) {
      console.error("[ChatWidget] Failed to send voice note:", error);
    } finally {
      setIsUploadingVoice(false);
    }
  };

  const formatRecordingDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={
          isMinimized
            ? "fixed bottom-16 sm:bottom-4 inset-x-3 sm:inset-auto sm:right-6 z-50 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col"
            : isExpanded
            ? "fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-6 z-50 w-full sm:w-[460px] h-full sm:h-[640px] sm:max-w-[calc(100vw-3rem)] sm:max-h-[calc(100vh-2rem)] bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border sm:border-gray-200 overflow-hidden flex flex-col"
            : "fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-4 sm:right-6 z-50 w-full sm:w-88 h-[80vh] max-h-[600px] sm:h-[480px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border-t sm:border border-gray-200 overflow-hidden flex flex-col"
        }
      >
        <div
          onClick={isMinimized ? toggleMinimize : undefined}
          className={`bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 sm:px-4 py-2.5 sm:py-3 text-white flex flex-col select-none ${
            isMinimized ? "cursor-pointer" : ""
          }`}
        >
          {!isMinimized && !isExpanded && (
            <div className="w-8 h-1 bg-white/40 rounded-full mx-auto mb-1.5 sm:hidden" />
          )}

          <div className="flex items-center justify-between w-full">
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
                  {isOtherUserTyping
                    ? "typing..."
                    : isConnected
                    ? "Connected"
                    : "Reconnecting..."}
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-0.5 sm:gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {!isMinimized && (
                <button
                  type="button"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <FiMinimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <FiMaximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={toggleMinimize}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white/90 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? "Restore" : "Minimize"}
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
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-[#F8FAFC] flex flex-col min-h-0">
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
                          className={`max-w-[85%] sm:max-w-[80%] px-3.5 py-2 rounded-2xl text-xs sm:text-[13px] leading-relaxed break-words shadow-xs ${
                            isMine
                              ? "bg-blue-600 text-white rounded-br-xs"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                          }`}
                        >
                          {msg.voiceNote && (
                            <VoiceNotePlayer
                              url={msg.voiceNote.url}
                              duration={msg.voiceNote.duration}
                              isMine={isMine}
                            />
                          )}
                          {msg.text && (
                            <p className={msg.voiceNote ? "mt-1.5" : ""}>{msg.text}</p>
                          )}
                          <div
                            className={`text-[9.5px] mt-0.5 ml-8 flex items-center justify-end gap-1 select-none font-medium ${
                              isMine ? "text-blue-100/90" : "text-gray-400"
                            }`}
                          >
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isMine && (
                              <span className="inline-flex items-center -mr-0.5">
                                {msg.status === "seen" ? (
                                  <IoCheckmarkDone className="w-3.5 h-3.5 text-sky-300" title={`Seen ${msg.seenAt ? `at ${formatMessageTime(msg.seenAt)}` : ""}`} />
                                ) : msg.status === "delivered" ? (
                                  <IoCheckmarkDone className="w-3.5 h-3.5 text-blue-200/80" title="Delivered" />
                                ) : (
                                  <IoCheckmark className="w-3.5 h-3.5 text-blue-200/80" title="Sent" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {isOtherUserTyping && (
                <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] text-gray-500 italic bg-white/70 rounded-xl w-fit shadow-2xs border border-gray-100/80 my-1 animate-pulse">
                  <span>{activeUser.name} is typing</span>
                  <span className="flex gap-0.5 items-center">
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {isRecording || isUploadingVoice ? (
              <div className="p-2 sm:p-2.5 bg-white border-t border-gray-100 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-rose-500 font-medium text-xs min-w-0">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                  <span className="font-mono text-gray-800 font-semibold">{formatRecordingDuration(duration)}</span>
                  <span className="text-gray-400 text-[11px] truncate">
                    {isUploadingVoice ? "Sending voice note..." : "Recording audio..."}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isUploadingVoice && (
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Cancel recording"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSendVoice}
                    disabled={isUploadingVoice}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center shrink-0"
                    title="Send voice note"
                  >
                    {isUploadingVoice ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiSend className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSend}
                className="p-2 sm:p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 sm:gap-2 pb-3 sm:pb-2.5"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={`Message ${activeUser.name}...`}
                  disabled={!isConnected}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleStartRecord}
                  disabled={!isConnected}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-40 rounded-xl transition-all cursor-pointer shrink-0"
                  title="Record voice note"
                >
                  <FiMic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  disabled={!inputText.trim() || !isConnected}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-xs disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                >
                  <FiSend className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
