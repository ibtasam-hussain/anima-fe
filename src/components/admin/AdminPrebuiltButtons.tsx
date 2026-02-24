import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

type ChatMode = "marketing" | "teaching";

export type AdminPrebuiltButton = {
  id: string;
  label: string;
  mode: ChatMode;
  starterText: string;
  parameters: string[];
};

const PARAM_TOKENS = ["{audience}", "{platform}", "{offer}", "{module}"];

const AdminPrebuiltButtons: React.FC = () => {
  const [buttons, setButtons] = useState<AdminPrebuiltButton[]>([
    {
      id: "1",
      label: "Launch email",
      mode: "marketing",
      starterText: "Draft a launch email for {offer} to {audience} on {platform}.",
      parameters: ["{audience}", "{platform}", "{offer}"],
    },
    {
      id: "2",
      label: "Lesson recap",
      mode: "teaching",
      starterText: "Summarise today’s session for {module} in 5 bullet points.",
      parameters: ["{module}"],
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPrebuiltButton | null>(null);

  const [form, setForm] = useState({
    label: "",
    mode: "marketing" as ChatMode,
    starterText: "",
    parameters: [] as string[],
  });

  const openNew = () => {
    setEditing(null);
    setForm({
      label: "",
      mode: "marketing",
      starterText: "",
      parameters: [],
    });
    setModalOpen(true);
  };

  const openEdit = (btn: AdminPrebuiltButton) => {
    setEditing(btn);
    setForm({
      label: btn.label,
      mode: btn.mode,
      starterText: btn.starterText,
      parameters: btn.parameters,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.label.trim() || !form.starterText.trim()) return;
    if (editing) {
      setButtons((prev) =>
        prev.map((b) =>
          b.id === editing.id
            ? {
                ...b,
                label: form.label.trim(),
                mode: form.mode,
                starterText: form.starterText.trim(),
                parameters: form.parameters,
              }
            : b
        )
      );
    } else {
      setButtons((prev) => [
        ...prev,
        {
          id: `btn-${Date.now()}`,
          label: form.label.trim(),
          mode: form.mode,
          starterText: form.starterText.trim(),
          parameters: form.parameters,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setButtons((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleParam = (token: string) => {
    setForm((prev) => {
      const exists = prev.parameters.includes(token);
      return {
        ...prev,
        parameters: exists
          ? prev.parameters.filter((p) => p !== token)
          : [...prev.parameters, token],
      };
    });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-gray-900">
            Prebuilt buttons
          </h2>
          <p className="text-xs text-gray-500">
            Curate reusable starter prompts for Marketing and Teaching modes.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-[#3B68F6] px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          New button
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-3">Label</th>
              <th className="px-5 py-3">Mode</th>
              <th className="px-5 py-3">Starter text</th>
              <th className="px-5 py-3">Parameters</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buttons.map((btn) => (
              <tr key={btn.id} className="border-t">
                <td className="px-5 py-3 text-gray-900">{btn.label}</td>
                <td className="px-5 py-3 text-xs">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] capitalize text-gray-700">
                    {btn.mode}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-700 max-w-xs">
                  <span className="line-clamp-2">{btn.starterText}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {btn.parameters.map((p) => (
                      <span
                        key={p}
                        className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(btn)}
                      className="rounded-full border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-50"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(btn.id)}
                      className="rounded-full border border-gray-200 bg-white p-1.5 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {buttons.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-4 text-sm text-gray-500 text-center"
                >
                  No prebuilt buttons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-200 p-5">
            <div className="mb-3">
              <h3 className="text-[16px] font-semibold text-gray-900">
                {editing ? "Edit button" : "New prebuilt button"}
              </h3>
              <p className="text-xs text-gray-500">
                Configure label, mode visibility, starter text, and parameters.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Label</label>
                <input
                  value={form.label}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#3B68F6]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Mode</label>
                <select
                  value={form.mode}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      mode: e.target.value as ChatMode,
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#3B68F6]"
                >
                  <option value="marketing">Marketing</option>
                  <option value="teaching">Teaching</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Starter text</label>
                <textarea
                  value={form.starterText}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      starterText: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#3B68F6]"
                  placeholder="Two‑line starter prompt the chat input will be prefilled with…"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Parameters</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {PARAM_TOKENS.map((token) => {
                    const active = form.parameters.includes(token);
                    return (
                      <button
                        key={token}
                        type="button"
                        onClick={() => toggleParam(token)}
                        className={[
                          "rounded-full border px-2 py-0.5 text-[11px]",
                          active
                            ? "bg-[#EEF2FF] border-[#3B68F6] text-[#3B68F6]"
                            : "bg-gray-50 border-gray-200 text-gray-700",
                        ].join(" ")}
                      >
                        {token}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-full bg-[#3B68F6] px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrebuiltButtons;

