"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RagUploaderProps {
  onUploadSuccess: (fileName: string) => void;
  onClear: () => void;
  activeFile: string | null;
}

export function RagUploader({ onUploadSuccess, onClear, activeFile }: RagUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-doc", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yükleme başarısız.");
      onUploadSuccess(data.fileName);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = async () => {
    await fetch("/api/upload-doc", { method: "DELETE" });
    onClear();
  };

  if (activeFile) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">RAG Bağlamı Aktif</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 truncate">{activeFile}</p>
        </div>
        <button
          onClick={handleClear}
          className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
          isDragging
            ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
            : "border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
        )}
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload className="w-5 h-5 text-slate-400" />
        )}
        <div className="text-center">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {isUploading ? "Yükleniyor..." : "PDF veya TXT yükle"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Merkez Bankası raporu, faaliyet raporu vb.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
