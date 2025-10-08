// src/components/AssistantMessage.tsx
import React from "react";
import { Download as DownloadIcon, Copy } from "lucide-react";
import logo from "../assets/biome.png";
import { toast } from "react-hot-toast";

type Props = {
  text: string;
  meta?: any;
  isActive?: boolean; // for sources
  onToggleSource?: () => void;
  isToolsActive?: boolean;
  onToggleTools?: () => void;
};


const AssistantMessage: React.FC<Props> = ({ text, isActive, onToggleSource, isToolsActive, onToggleTools }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="flex items-start gap-3">
      {/* AI Avatar */}
      <img
        src={logo}
        alt="AI"
        className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover mt-1 ring-2 ring-white"
      />

      {/* Message bubble */}
      <div className="flex flex-col max-w-3xl">
        <div className="rounded-lg border border-gray-200 bg-gray-50 shadow-sm overflow-hidden">
          <div className="px-4 py-3 text-sm text-gray-800 whitespace-pre-wrap">
            {text}
          </div>

          {/* Source + Download buttons */}
{/* Source + Tools buttons */}
<div className="flex items-center gap-2 border-t border-gray-200 bg-gray-100 px-3 py-2">
  <button
    onClick={onToggleSource}
    className={`rounded-md border px-2.5 py-1 text-[12px] shadow-sm transition ${
      isActive
        ? "bg-gray-200 border-gray-300 text-gray-800"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
    }`}
  >
    {isActive ? "Hide Sources" : "Show Sources"}
  </button>

  <button
    onClick={onToggleTools}
    className={`rounded-md border px-2.5 py-1 text-[12px] shadow-sm transition ${
      isToolsActive
        ? "bg-gray-200 border-gray-300 text-gray-800"
        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
    }`}
  >
    {isToolsActive ? "Hide Tools" : "Show Tools"}
  </button>
</div>

        </div>

        {/* Timestamp + Copy */}
        <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500 px-1">
          <span>{new Date().toLocaleTimeString()}</span>
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

