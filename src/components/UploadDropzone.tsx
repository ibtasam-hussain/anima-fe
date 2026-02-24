import React, { useEffect } from "react";
import { Paperclip, X } from "lucide-react";

export type UploadFileState = {
  id: string;
  file: File;
  progress: number;
};

type UploadDropzoneProps = {
  files: UploadFileState[];
  onFilesChange: (files: UploadFileState[]) => void;
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

const maxSizeMb = 10;

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  files,
  onFilesChange,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Simulate upload progress
    if (!files.length) return;

    const interval = setInterval(() => {
      onFilesChange(
        files.map((f) =>
          f.progress >= 100 ? f : { ...f, progress: Math.min(100, f.progress + 15) }
        )
      );
    }, 500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length]);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;

    const next: UploadFileState[] = [];

    Array.from(selected).forEach((file) => {
      const tooBig = file.size / (1024 * 1024) > maxSizeMb;
      const invalid =
        !allowedTypes.includes(file.type) &&
        !/\.(pdf|docx?|txt)$/i.test(file.name || "");

      if (tooBig || invalid) {
        // We only track valid files in this lightweight mock component.
        return;
      }
      next.push({ id: uid(), file, progress: 0 });
    });

    if (next.length) {
      onFilesChange([...files, ...next]);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Attached file chips */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((item) => {
            const sizeMb = item.file.size / (1024 * 1024);
            const tooBig = sizeMb > maxSizeMb;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700"
              >
                <span className="max-w-[160px] truncate">{item.file.name}</span>
                <span className="text-[10px] text-gray-500">
                  {sizeMb.toFixed(1)} MB
                </span>
                {tooBig && (
                  <span className="text-[10px] text-red-500 font-medium">
                    &gt; {maxSizeMb} MB
                  </span>
                )}
                <div className="relative h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#3B68F6]"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(item.id)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Remove file"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Trigger button + hidden input */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
        aria-label="Upload documents"
      >
        <Paperclip className="h-4 w-4" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

export default UploadDropzone;

