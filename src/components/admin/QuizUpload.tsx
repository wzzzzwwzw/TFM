"use client";
import React, { useRef, useState } from "react";

type QuizUploadProps = {
  onQuizReady: (quiz: any) => void;
};

const QuizUpload = ({ onQuizReady }: QuizUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      // Accept .json or .txt files
      if (
        selectedFile.type !== "application/json" &&
        selectedFile.type !== "text/plain" &&
        !selectedFile.name.endsWith(".json") &&
        !selectedFile.name.endsWith(".txt")
      ) {
        setError("Only JSON or TXT files are accepted.");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a JSON or TXT file to upload.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-and-generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        onQuizReady({ title: file.name, questions: data.questions });
        setFile(null);
      } else {
        setError("Failed to generate quiz from file.");
      }
    } catch (e) {
      setError("Failed to generate quiz from file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".json,.txt"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <button onClick={handleButtonClick} className="bg-blue-500 text-white px-4 py-2 rounded">
        Select File
      </button>
      <button onClick={handleUpload} disabled={uploading || !file} className="ml-2 bg-green-500 text-white px-4 py-2 rounded">
        {uploading ? "Uploading..." : "Upload & Generate"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default QuizUpload;