"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUploadCloud, FiImage, FiVideo, FiLoader } from "react-icons/fi";
import { useAddStory } from "../hooks/useStory";

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateStoryModal({ isOpen, onClose }: CreateStoryModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addStoryMutation = useAddStory();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/") && !selected.type.startsWith("video/")) {
      setErrorMsg("Please upload an image or video file.");
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setErrorMsg("File size must be under 50MB.");
      return;
    }

    setErrorMsg("");
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
  };

  const handleClose = () => {
    if (addStoryMutation.isPending) return;
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setCaption("");
    setErrorMsg("");
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select a photo or video to share.");
      return;
    }

    const formData = new FormData();
    formData.append("media", file);
    if (caption.trim()) {
      formData.append("caption", caption.trim());
    }

    addStoryMutation.mutate(formData, {
      onSuccess: () => {
        handleClose();
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Failed to create story";
        setErrorMsg(msg);
      },
    });
  };

  const isVideo = file?.type.startsWith("video/");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create New Story</h3>
              <button
                type="button"
                onClick={handleClose}
                disabled={addStoryMutation.isPending}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              {errorMsg && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                  {errorMsg}
                </div>
              )}

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 hover:border-purple-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-purple-50/20 transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-14 h-14 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FiUploadCloud className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Click to upload photo or video</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, MP4 up to 50MB</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black/95 max-h-72 flex items-center justify-center">
                  {isVideo ? (
                    <video
                      src={previewUrl}
                      controls
                      autoPlay
                      muted
                      className="max-h-72 w-auto object-contain"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Story preview"
                      className="max-h-72 w-auto object-contain"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors backdrop-blur-md"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's on your mind?..."
                  maxLength={150}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-800"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={addStoryMutation.isPending}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!file || addStoryMutation.isPending}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm shadow-purple-200 transition-all"
                >
                  {addStoryMutation.isPending ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Share to Story</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
