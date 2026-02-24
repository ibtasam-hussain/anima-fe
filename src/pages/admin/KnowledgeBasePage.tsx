import React, { useState } from "react";
import CanonCategoryCard, {
  type CanonCategory,
} from "@/components/admin/CanonCategoryCard";
import CanonDocsTable, {
  type CanonDoc,
} from "@/components/admin/CanonDocsTable";
import GuidanceEditor from "@/components/admin/GuidanceEditor";
import AdminPrebuiltButtons from "@/components/admin/AdminPrebuiltButtons";
import { Upload as UploadIcon } from "lucide-react";
import { toast } from "react-hot-toast";

const INITIAL_CATEGORIES: CanonCategory[] = [
  {
    id: "knowledge",
    name: "Knowledge Canon",
    description: "Master library of programmes, modules, and core IP.",
  },
  {
    id: "voice",
    name: "Voice & Style Canon",
    description: "How Anima should speak, write, and show up.",
  },
  {
    id: "marketing",
    name: "Marketing & Strategy Canon",
    description: "Launches, campaigns, and marketing frameworks.",
  },
];

const INITIAL_DOCS: Record<string, CanonDoc[]> = {
  knowledge: [
    {
      id: "k1",
      filename: "01-core-programme-notes.pdf",
      version: "v3",
      active: true,
      updatedAt: new Date().toISOString(),
      status: "indexed",
    },
  ],
  voice: [
    {
      id: "v1",
      filename: "brand-voice-guide.docx",
      version: "v2",
      active: true,
      updatedAt: new Date().toISOString(),
      status: "indexed",
    },
  ],
  marketing: [],
};

const KnowledgeBasePage: React.FC = () => {
  const [categories] = useState<CanonCategory[]>(INITIAL_CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    INITIAL_CATEGORIES[0].id
  );
  const [docsByCategory, setDocsByCategory] =
    useState<Record<string, CanonDoc[]>>(INITIAL_DOCS);

  const selectedDocs = docsByCategory[selectedCategoryId] || [];
  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) ?? categories[0];

  const handleUploadMock = () => {
    const id = `doc-${Date.now()}`;
    const next: CanonDoc = {
      id,
      filename: `new-document-${docsByCategory[selectedCategoryId]?.length || 0}.pdf`,
      version: "v1",
      active: true,
      updatedAt: new Date().toISOString(),
      status: "indexing",
    };
    setDocsByCategory((prev) => ({
      ...prev,
      [selectedCategoryId]: [...(prev[selectedCategoryId] || []), next],
    }));
    toast.success("Document added to canon (UI only).");
  };

  const toggleActive = (id: string) => {
    setDocsByCategory((prev) => ({
      ...prev,
      [selectedCategoryId]: (prev[selectedCategoryId] || []).map((d) =>
        d.id === id ? { ...d, active: !d.active } : d
      ),
    }));
  };

  const reindexDoc = (id: string) => {
    setDocsByCategory((prev) => ({
      ...prev,
      [selectedCategoryId]: (prev[selectedCategoryId] || []).map((d) =>
        d.id === id ? { ...d, status: "indexing" } : d
      ),
    }));
    toast.success("Re‑index triggered (UI only).");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-gray-900">
            Canon Categories
          </h1>
          <p className="text-xs text-gray-500">
            Configure the source canons that Anima uses for Marketing and
            Teaching modes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleUploadMock}
          className="inline-flex items-center gap-2 rounded-full bg-[#3B68F6] px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
        >
          <UploadIcon className="h-4 w-4" />
          Upload to selected canon
        </button>
      </div>

      {/* Category cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <CanonCategoryCard
            key={cat.id}
            category={cat}
            onOpen={() => setSelectedCategoryId(cat.id)}
          />
        ))}
      </div>

      {/* Documents */}
      <div className="w-full space-y-3">
        <h2 className="text-[15px] font-semibold text-gray-900">
          {selectedCategory.name} · documents
        </h2>
        <CanonDocsTable
          docs={selectedDocs}
          onToggleActive={toggleActive}
          onReindex={reindexDoc}
        />
      </div>


    </div>
  );
};

export default KnowledgeBasePage;
