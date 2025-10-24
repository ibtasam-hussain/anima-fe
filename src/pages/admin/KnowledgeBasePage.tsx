import React, { useState } from "react";
import {
  Upload,
  Trash2,
  FileVideo,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface SubChild {
  id: number;
  name: string;
}

interface Child {
  id: number;
  name: string;
  subchildren?: SubChild[];
}

interface FileItem {
  id: number;
  name: string;
  type: string;
  children?: Child[];
}

const KnowledgeBasePage: React.FC = () => {
const [files, setFiles] = useState<FileItem[]>(
  Array.from({ length: 10 }, (_, i) => {
    const moduleId = i + 1;
    return {
      id: moduleId,
      name: `Module ${moduleId}`,
      type: "Folder",
      children: [
        {
          id: moduleId * 100 + 1,
          name: "Videos",
          subchildren: Array.from({ length: 5 }, (_, j) => ({
            id: moduleId * 1000 + j + 1,
            name: `Video_${j + 1}.mp4`,
          })),
        },
        {
          id: moduleId * 100 + 2,
          name: "Guest Training",
          subchildren: Array.from({ length: 5 }, (_, j) => ({
            id: moduleId * 2000 + j + 1,
            name: `Training_${j + 1}.mp4`,
          })),
        },
        {
          id: moduleId * 100 + 3,
          name: "Slides",
          subchildren: Array.from({ length: 5 }, (_, j) => ({
            id: moduleId * 3000 + j + 1,
            name: `Slide_${j + 1}.pdf`,
          })),
        },
        {
          id: moduleId * 100 + 4,
          name: "Resources & Tools",
          subchildren: Array.from({ length: 5 }, (_, j) => ({
            id: moduleId * 4000 + j + 1,
            name: `Resource_${j + 1}.zip`,
          })),
        },
      ],
    };
  })
);


  const [expanded, setExpanded] = useState<number | null>(null);
  const [childExpanded, setChildExpanded] = useState<number | null>(null);

  const handleUpload = () => toast.success("Upload modal (coming soon)");
  const handleDelete = (id: number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    toast.success("File deleted");
  };

  const toggleExpand = (id: number) =>
    setExpanded(expanded === id ? null : id);
  const toggleChildExpand = (id: number) =>
    setChildExpanded(childExpanded === id ? null : id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[20px] font-semibold text-gray-900">
          Knowledge Base
        </h1>
        <button
          onClick={handleUpload}
          className="flex items-center gap-2 bg-[#3B68F6] text-white px-4 py-2 rounded-full hover:brightness-110"
        >
          <Upload className="h-4 w-4" /> Upload
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-5 py-3">File</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <React.Fragment key={f.id}>
                {/* LEVEL 1 */}
                <tr
                  className="border-t hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleExpand(f.id)}
                >
                  <td className="px-5 py-3 flex items-center gap-2">
                    {expanded === f.id ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <FileVideo className="h-4 w-4 text-gray-500" />
                    <span>{f.name}</span>
                  </td>
                  <td className="px-5 py-3">{f.type}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(f.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>

                {/* LEVEL 2 */}
                {expanded === f.id &&
                  f.children?.map((child) => (
                    <React.Fragment key={child.id}>
                      <tr
                        className="border-t bg-gray-50 cursor-pointer"
                        onClick={() => toggleChildExpand(child.id)}
                      >
                        <td className="px-10 py-2 flex items-center gap-2">
                          {childExpanded === child.id ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          <FileVideo className="h-4 w-4 text-gray-400" />
                          {child.name}
                        </td>
                        <td className="px-5 py-2 text-gray-500">—</td>
                        <td className="px-5 py-2 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toast.success(`Opened ${child.name}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            View
                          </button>
                        </td>
                      </tr>

                      {/* LEVEL 3 */}
                      {childExpanded === child.id &&
                        child.subchildren?.map((sub) => (
                          <tr
                            key={sub.id}
                            className="border-t bg-gray-100 text-gray-700"
                          >
                            <td className="px-16 py-2 flex items-center gap-2">
                              <FileVideo className="h-4 w-4 text-gray-400" />
                              {sub.name}
                            </td>
                            <td className="px-5 py-2 text-gray-400">—</td>
                            <td className="px-5 py-2 text-right">
                              <button
                                onClick={() =>
                                  toast.success(`Opened ${sub.name}`)
                                }
                                className="text-blue-600 hover:text-blue-800 text-xs"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
