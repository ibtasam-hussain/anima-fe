import React from "react";
import { ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";

export type CanonDoc = {
  id: string;
  filename: string;
  version: string;
  active: boolean;
  updatedAt: string;
  status: "indexed" | "indexing" | "error";
};

type Props = {
  docs: CanonDoc[];
  onToggleActive: (id: string) => void;
  onReindex: (id: string) => void;
};

const statusClasses: Record<CanonDoc["status"], string> = {
  indexed: "bg-green-50 text-green-700 border-green-100",
  indexing: "bg-amber-50 text-amber-700 border-amber-100",
  error: "bg-red-50 text-red-700 border-red-100",
};

const CanonDocsTable: React.FC<Props> = ({ docs, onToggleActive, onReindex }) => {
  if (!docs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
        No documents yet. Upload canon documents to teach Anima this category.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-5 py-3">File name</th>
            <th className="px-5 py-3">Version</th>
            <th className="px-5 py-3">Updated</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <tr key={doc.id} className="border-t">
              <td className="px-5 py-3 text-gray-900">{doc.filename}</td>
              <td className="px-5 py-3 text-gray-700">{doc.version}</td>
              <td className="px-5 py-3 text-gray-500 text-xs">
                {new Date(doc.updatedAt).toLocaleString()}
              </td>
              <td className="px-5 py-3">
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                    statusClasses[doc.status],
                  ].join(" ")}
                >
                  {doc.status === "indexed" && "Indexed"}
                  {doc.status === "indexing" && "Indexing…"}
                  {doc.status === "error" && "Error"}
                </span>
              </td>
              <td className="px-5 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleActive(doc.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                  >
                    {doc.active ? (
                      <>
                        <ToggleRight className="h-3.5 w-3.5 text-[#3B68F6]" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                        Inactive
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onReindex(doc.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] text-gray-700 hover:bg-gray-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Re‑index
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CanonDocsTable;

