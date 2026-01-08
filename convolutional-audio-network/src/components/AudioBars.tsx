"use client";
import React from "react";

export default function AudioBars() {
  return (
    <div className="flex items-end gap-[3px] h-8 mx-2">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 bg-indigo-400 rounded-t-sm animate-music-bar"
          style={{
            animationDelay: `${i * 0.2}s`,
            height: "40%",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes music-bar {
          0%,
          100% {
            height: 20%;
            opacity: 0.5;
          }
          50% {
            height: 100%;
            opacity: 1;
            box-shadow: 0 0 8px #6366f1;
          }
        }
        .animate-music-bar {
          animation: music-bar 1s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}