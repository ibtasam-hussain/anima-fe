// src/components/AssistantMessage.tsx
import React from "react";
import { Download as DownloadIcon, Copy } from "lucide-react";
import logo from "../assets/logo.png";
import { toast } from "react-hot-toast";

type Props = {
  text: string;
};

const AssistantMessage: React.FC<Props> = ({ text }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="flex items-start gap-2">
      <div className="flex flex-col max-w-3xl">
        {/* Message bubble */}
        <div className="rounded-lg border border-gray-200 opacity-80 bg-gray-50 shadow-sm overflow-hidden">
          {/* Logo + Text */}
          <div className="flex items-start gap-3 px-4 py-3">
            <img
              src={logo}
              alt="AI"
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            <div className="text-sm text-gray-800 leading-relaxed">
              {text}
            </div>
          </div>

          {/* Source Row (aligned left) */}
          <div className="flex items-center gap-2 border-t border-gray-200 bg-gray-100 px-3 py-2">
            <span className="text-[12px] text-gray-500">Source :</span>
            <button className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-[12px] text-gray-700 shadow-sm hover:bg-gray-100">
              Provide Source
            </button>
            <button className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-[12px] text-gray-700 shadow-sm hover:bg-gray-100">
              <DownloadIcon className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Timestamp + Copy (below message) */}
        <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500 px-1">
          <span>{new Date().toLocaleTimeString()}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantMessage;
