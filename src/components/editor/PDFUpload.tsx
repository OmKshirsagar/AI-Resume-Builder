"use client";

import { useState, useRef } from "react";
import { extractResumeFromPDF } from "@/app/actions/extract";
import type { ResumeData } from "@/schemas/resume";
import { Loader2, Upload, FileText, AlertCircle } from "lucide-react";

interface PDFUploadProps {
  onExtracted: (data: ResumeData) => void;
}

export function PDFUpload({ onExtracted }: PDFUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }

    // Check file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      setError("File size exceeds 4MB limit.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await extractResumeFromPDF(formData);

      if (result.success) {
        // Map extracted data to include IDs for the resume store
        const dataWithIds: ResumeData = {
          personalInfo: result.data.personalInfo,
          experience: result.data.experience.map((exp) => ({
            ...exp,
            id: crypto.randomUUID(),
          })),
          education: result.data.education.map((edu) => ({
            ...edu,
            id: crypto.randomUUID(),
          })),
          skills: result.data.skills.map((skill) => ({
            ...skill,
            id: crypto.randomUUID(),
          })),
          projects: result.data.projects.map((project) => ({
            ...project,
            id: crypto.randomUUID(),
          })),
        };

        onExtracted(dataWithIds);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
          ${isUploading ? "bg-muted/50 border-muted" : "hover:bg-muted/30 border-muted-foreground/20 hover:border-primary/50"}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            !isUploading && fileInputRef.current?.click();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload PDF resume"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Extracting resume data...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF (max. 4MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {!isUploading && !error && (
        <div className="flex items-center gap-2 text-muted-foreground text-xs justify-center">
          <FileText className="h-3 w-3" />
          <p>AI will parse your PDF into the editor automatically.</p>
        </div>
      )}
    </div>
  );
}
