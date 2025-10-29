import React, { useEffect, useState } from "react";
import { CheckCircle, Folder, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAllUnansweredQueries, markAsClosed } from "@/apis/userAndAdminApi";

interface Query {
  id: number;
  message: string;
  status: string;
  type?: "folder" | "file";
  children?: Query[];
}

const UnansweredPage: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);
  const [openFolders, setOpenFolders] = useState<Record<number, boolean>>({});

  // ✅ Fetch unanswered queries
  const fetchQueries = async () => {
    try {
      setLoading(true);
      const data = await getAllUnansweredQueries();
      setQueries(data.queries || []);
    } catch {
      toast.error("Failed to load unanswered queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  // ✅ Toggle folder expand/collapse
  const toggleFolder = (id: number) => {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ✅ Mark query as solved
  const handleSolve = async (id: number) => {
    try {
      await markAsClosed(id);
      setQueries((prev) => prev.filter((q) => q.id !== id));
      toast.success("Marked as solved");
    } catch {
      toast.error("Failed to mark as solved");
    }
  };

  // ✅ Recursive renderer for nested structure
  const renderRows = (items: Query[], level = 0) =>
    items.map((item) => {
      const padding = `${level * 20 + 16}px`;

      return (
        <React.Fragment key={item.id}>
          <tr className="border-t hover:bg-gray-50">
            <td className="px-5 py-3" style={{ paddingLeft: padding }}>
              <div className="flex items-center gap-2">
                {item.type === "folder" ? (
                  <button
                    onClick={() => toggleFolder(item.id)}
                    className="flex items-center gap-1 text-gray-700"
                  >
                    {openFolders[item.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <Folder className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{item.message}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>{item.message}</span>
                  </div>
                )}
              </div>
            </td>

            <td className="px-5 py-3 text-right">
              <button
                onClick={() => handleSolve(item.id)}
                className="flex items-center gap-2 text-green-600 hover:text-green-800 ml-auto"
              >
                <CheckCircle className="h-4 w-4" /> Solve
              </button>
            </td>
          </tr>

          {/* Render nested children if folder is open */}
          {item.children &&
            openFolders[item.id] &&
            renderRows(item.children, level + 1)}
        </React.Fragment>
      );
    });

  return (
    <div>
      <h1 className="text-[20px] font-semibold text-gray-900 mb-6">
        Unanswered Queries
      </h1>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center text-gray-500 py-10 text-sm">
            Loading unanswered queries...
          </div>
        ) : queries.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-sm">
            🎉 All queries are solved!
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-3">Question</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
<tbody>
  {queries.map((q) => {
    // Calculate indentation level based on query properties
    const level = (q as any).level || 0;
    const isFile = (q as any).type === "file" || /\.[a-z0-9]+$/i.test(q.message);
    const leftIndent = level * 24; // 24px per level

    return (
      <tr key={q.id} className="border-t hover:bg-gray-50">
        <td className="py-3">
          <div
            className="px-5 flex items-center gap-2"
            style={{ paddingLeft: `${leftIndent + 20}px` }}
          >
            {isFile ? (
              <FileText className="w-4 h-4 text-gray-500" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500" />
            )}
            <span>{q.message}</span>
          </div>
        </td>

        <td className="px-5 py-3 text-right">
          <button
            onClick={() => handleSolve(q.id)}
            className="flex items-center gap-2 text-green-600 hover:text-green-800 ml-auto"
          >
            <CheckCircle className="h-4 w-4" /> Solve
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

          </table>
        )}
      </div>
    </div>
  );
};

export default UnansweredPage;
