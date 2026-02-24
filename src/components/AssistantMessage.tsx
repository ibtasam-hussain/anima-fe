// src/components/AssistantMessage.tsx
import React from "react";
import { Copy } from "lucide-react";
import { toast } from "react-hot-toast";

type Props = {
  text: string;
  meta?: any;
};


const AssistantMessage: React.FC<Props> = ({ text, meta }) => {

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="flex items-start gap-3">
      {/* AI Avatar */}
      <div
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center mt-1 ring-2 ring-white bg-[#3B68F6] text-white text-xs font-bold shrink-0"
        aria-label="ANIMAAI"
        title="ANIMAAI"
      >
        A
      </div>

      {/* Message bubble */}
      <div className="flex flex-col max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
            {text}
          </div>
        </div>

{/* Timestamp + Copy */}
<div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500 px-1">
  <span>
    {meta?.ai_timestamp
      ? new Date(meta.ai_timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
  </span>
  <button
    onClick={handleCopy}
    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
  >
    <Copy className="h-3.5 w-3.5" />
    <span>Copy</span>
  </button>
</div>

      </div>
    </div>
  );
};

export default AssistantMessage;

