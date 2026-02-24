import React from "react";

type ChatMode = "marketing" | "teaching";

export type PrebuiltPrompt = {
  id: string;
  label: string;
  mode: ChatMode;
  description?: string;
  text: string; // 2‑line starter text
};

type PrebuiltPromptBarProps = {
  mode: ChatMode | null;
  prompts: PrebuiltPrompt[];
  onInsert: (text: string) => void;
};

const PrebuiltPromptBar: React.FC<PrebuiltPromptBarProps> = ({
  mode,
  prompts,
  onInsert,
}) => {
  if (!mode) return null;

  const filtered = prompts.filter((p) => p.mode === mode);
  if (!filtered.length) return null;

  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
          Quick starters
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filtered.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            onClick={() => onInsert(prompt.text)}
            className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
          >
            {prompt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PrebuiltPromptBar;

