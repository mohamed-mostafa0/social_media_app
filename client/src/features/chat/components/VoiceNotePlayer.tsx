"use client";

import { useState, useRef, useEffect } from "react";
import { FiPlay, FiPause } from "react-icons/fi";

interface VoiceNotePlayerProps {
  url: string;
  duration?: number;
  isMine: boolean;
}

export function VoiceNotePlayer({ url, duration = 0, isMine }: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const barHeights = [
    30, 60, 45, 80, 55, 90, 75, 40, 65, 85, 30, 70,
    95, 60, 40, 80, 50, 90, 65, 35, 75, 45, 60, 30
  ];

  useEffect(() => {
    if (duration > 0) {
      setTotalDuration(duration);
    }
  }, [duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.error("[Audio play error]:", err));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && (!totalDuration || totalDuration === 0)) {
      setTotalDuration(Math.round(audioRef.current.duration) || 0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (index: number) => {
    if (!audioRef.current || totalDuration <= 0) return;
    const seekPercentage = (index + 1) / barHeights.length;
    const newTime = seekPercentage * totalDuration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  const formatTime = (secs: number) => {
    const rounded = Math.floor(secs);
    const mins = Math.floor(rounded / 60);
    const remaining = rounded % 60;
    return `${mins}:${remaining < 10 ? "0" : ""}${remaining}`;
  };

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 py-1 px-0.5 w-full max-w-[200px] sm:max-w-[240px] select-none">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
      />

      <button
        type="button"
        onClick={togglePlay}
        className={`w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer shadow-xs ${
          isMine
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <FiPause className="w-3.5 h-3.5" />
        ) : (
          <FiPlay className="w-3.5 h-3.5 ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
        <div className="flex items-center gap-[2px] sm:gap-[2.5px] h-6 cursor-pointer">
          {barHeights.map((height, i) => {
            const barProgress = ((i + 1) / barHeights.length) * 100;
            const isPlayed = barProgress <= progress;

            return (
              <div
                key={i}
                onClick={() => handleSeek(i)}
                style={{ height: `${height}%` }}
                className={`w-[2px] sm:w-[2.5px] rounded-full transition-colors duration-100 ${
                  isMine
                    ? isPlayed
                      ? "bg-white"
                      : "bg-blue-300/60 hover:bg-blue-200"
                    : isPlayed
                    ? "bg-blue-600"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono leading-none">
          <span className={isMine ? "text-blue-100" : "text-gray-400"}>
            {formatTime(isPlaying ? currentTime : totalDuration)}
          </span>
        </div>
      </div>
    </div>
  );
}
