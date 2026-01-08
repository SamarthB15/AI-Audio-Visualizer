"use client";
import React from "react";

export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* 1. Deep Space Base */}
      <div className="absolute inset-0 bg-neutral-950" />

      {/* 2. Floating Nebula Orbs (Animated) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/20 blur-[120px] animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-900/20 blur-[120px] animate-float-delayed" />
      <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-blue-500/10 blur-[100px] animate-pulse-slow" />

      {/* 3. Cyber Grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "100px 100px",
          maskImage:
            "radial-gradient(circle at center, black, transparent 80%)",
        }}
      />

      {/* 4. Film Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(30px, 50px) rotate(10deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes float-delayed {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          33% { transform: translate(-30px, -50px) rotate(-10deg); }
          66% { transform: translate(20px, -20px) rotate(5deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}