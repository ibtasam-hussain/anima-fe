import React from "react";

type ChatMode = "marketing" | "teaching";

type ModeSelectModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectMode: (mode: ChatMode) => void;
};

const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  open,
  onClose,
  onSelectMode,
}) => {
  if (!open) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-select-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="mode-select-title"
          className="text-lg font-semibold text-gray-900 mb-2"
        >
          Start a new chat
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Choose how you want Anima to help in this conversation.
        </p>

        <div className="space-y-3">
          {/* Marketing */}
          <button
            type="button"
            onClick={() => onSelectMode("marketing")}
            className="w-full text-left rounded-xl border border-gray-200 hover:border-[#3B68F6] hover:bg-[#EEF2FF] transition p-4"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[15px] font-semibold text-gray-900">
                Marketing / Copy
              </span>
              <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-[11px] font-medium text-[#3B68F6]">
                Campaigns & launches
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                <span className="font-medium mr-1">Knowledge</span> ON
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                <span className="font-medium mr-1">Voice</span> LOW
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                <span className="font-medium mr-1">Marketing Strategy</span> ON
              </span>
            </div>
          </button>

          {/* Teaching */}
          <button
            type="button"
            onClick={() => onSelectMode("teaching")}
            className="w-full text-left rounded-xl border border-gray-200 hover:border-[#3B68F6] hover:bg-[#EEF2FF] transition p-4"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[15px] font-semibold text-gray-900">
                Teaching / Facilitation
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-700">
                Cohorts & workshops
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                <span className="font-medium mr-1">Knowledge</span> ON
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                <span className="font-medium mr-1">Voice</span> ON
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
                <span className="font-medium mr-1">Marketing Strategy</span> OFF
              </span>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ModeSelectModal;

