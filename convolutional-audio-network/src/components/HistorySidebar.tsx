"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "~/components/ui/scroll-area"; // Assuming you have shadcn ScrollArea or use a div
import { Button } from "~/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface HistoryItem {
  id: string;
  fileName: string;
  topClass: string;
  confidence: number;
  createdAt: Date;
}

export default function HistorySidebar({
  history,
  isOpen,
  setIsOpen,
}: {
  history: HistoryItem[];
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  return (
    <>
      {/* Toggle Button (Visible when closed) */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-4 z-50 border border-white/10 bg-neutral-900/50 backdrop-blur-md hover:bg-neutral-800 text-white"
        >
          <span className="mr-2">📂</span> Data Logs
        </Button>
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 transform border-r border-white/10 bg-neutral-950/95 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-lg font-bold text-white tracking-wider">
            ANALYSIS LOGS
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white"
          >
            ✕
          </Button>
        </div>

        <div className="p-4 space-y-3 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar">
          {history.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center mt-10">
              No records found via secure channel.
            </p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg border border-white/5 bg-white/5 p-3 transition-all hover:border-indigo-500/50 hover:bg-white/10"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-mono text-xs text-indigo-300 truncate max-w-[150px]">
                    {item.fileName}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {formatDistanceToNow(new Date(item.createdAt))} ago
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {/* You might need to import getEmojiForClass helper or pass emoji */}
                    ⚡
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">
                      {item.topClass.replaceAll("_", " ")}
                    </p>
                    <div className="h-1 w-24 bg-neutral-800 rounded-full mt-1">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${item.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}