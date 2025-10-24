import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getAllUnansweredQueries,
  markAsClosed,
} from "@/apis/userAndAdminApi";

interface Query {
  id: number;
  message: string;
  status: string;
}

const UnansweredPage: React.FC = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(false);

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
              {queries.map((q) => (
                <tr key={q.id} className="border-t">
                  <td className="px-5 py-3">{q.message}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleSolve(q.id)}
                      className="flex items-center gap-2 text-green-600 hover:text-green-800 ml-auto"
                    >
                      <CheckCircle className="h-4 w-4" /> Solve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UnansweredPage;
