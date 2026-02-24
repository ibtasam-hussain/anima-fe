import React, { useState } from "react";

type GuidanceVersion = {
  id: string;
  label: string;
  createdAt: string;
  content: string;
};

type Props = {
  initialVersions: GuidanceVersion[];
};

const GuidanceEditor: React.FC<Props> = ({ initialVersions }) => {
  const [versions, setVersions] = useState<GuidanceVersion[]>(initialVersions);
  const [selectedId, setSelectedId] = useState<string>(
    initialVersions[0]?.id ?? ""
  );
  const [draft, setDraft] = useState<string>(
    initialVersions[0]?.content ?? ""
  );

  const selected = versions.find((v) => v.id === selectedId) ?? versions[0];

  const handleSaveNewVersion = () => {
    if (!draft.trim()) return;
    const id = `v-${Date.now()}`;
    const next: GuidanceVersion = {
      id,
      label: `v${versions.length + 1}`,
      createdAt: new Date().toISOString(),
      content: draft,
    };
    const all = [next, ...versions];
    setVersions(all);
    setSelectedId(id);
  };

  const handleSelectVersion = (id: string) => {
    const v = versions.find((x) => x.id === id);
    if (!v) return;
    setSelectedId(id);
    setDraft(v.content);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-gray-900">
            Prompt guidance
          </h3>
          {selected && (
            <p className="text-[11px] text-gray-500">
              Current version:{" "}
              <span className="font-medium">{selected.label}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selected?.id}
            onChange={(e) => handleSelectVersion(e.target.value)}
            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label} ·{" "}
                {new Date(v.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
          className="h-full w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#3B68F6]"
          placeholder="Describe how Anima should speak, think, and respond when using this canon…"
        />
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleSaveNewVersion}
          className="rounded-full bg-[#3B68F6] px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110"
        >
          Save new version
        </button>
      </div>
    </div>
  );
};

export default GuidanceEditor;

