// src/components/AssistantMessage.tsx
import React from "react";

type AssistantMessageProps = {
  text: string;
  tools?: string[]; // exactly 2 if you want
};

const AssistantMessage: React.FC<AssistantMessageProps> = ({ text, tools = [] }) => {
  return (
    <div className="w-full rounded-xl border border-gray-300 bg-white/10 shadow-lg">
      {/* Top: avatar + message */}
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Avatar */}
        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#e5ebff] text-[#3B68F6] shrink-0">
          {/* Simple icon to match the screenshot style */}
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.64 5.64l2.12 2.12m8.48 8.48l2.12 2.12M5.64 18.36l2.12-2.12m8.48-8.48l2.12-2.12" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>

        {/* Message text */}
        <p className="text-[14px] leading-relaxed text-gray-800">
          {text}
        </p>
      </div>

      {/* Bottom: Suggested tools */}
      <div className="border-t border-gray-300 bg-white/10 px-4 py-2 rounded-b-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-gray-500">Suggested tools:</span>

          {tools.slice(0, 2).map((t, i) => (
            <button
              key={i}
              className="rounded-md border border-gray-300 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-700 hover:bg-gray-100"
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;
