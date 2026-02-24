import React from "react";
import { FolderKanban, ChevronRight, Edit2, Trash2 } from "lucide-react";

export type CanonCategory = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  category: CanonCategory;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

const CanonCategoryCard: React.FC<Props> = ({
  category,
  onOpen,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#3B68F6]">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">
              {category.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {category.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50"
              aria-label="Edit category"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-full border border-gray-200 bg-white p-1.5 text-red-500 hover:bg-red-50"
              aria-label="Delete category"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onOpen}
        className="mt-4 inline-flex items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
      >
        <span>Open documents</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default CanonCategoryCard;

