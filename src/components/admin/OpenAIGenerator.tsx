"use client";
import React, { useState } from "react";

type OpenAIGeneratorProps = {
  onQuizReady: (quiz: any) => void;
};

const OpenAIGenerator = ({ onQuizReady }: OpenAIGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    try {
      const res = await fetch("/api/upload-and-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_prompt: prompt }),
      });
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        onQuizReady({ title: prompt, questions: data.questions });
      } else {
        setError("Failed to generate quiz questions.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Generate Quiz Questions</h2>
      <textarea
        className="w-full border p-2 mb-2"
        rows={4}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter topic or text for quiz generation"
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleGenerate}
        disabled={loading || !prompt}
      >
        {loading ? "Generating..." : "Generate"}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <div className="mt-4">
        {questions.length > 0 &&
          questions.map((q, idx) => (
            <div key={idx} className="mb-2 p-2 border rounded">
              <strong>Q:</strong> {q.question}
              <br />
              <strong>A:</strong> {q.answer}
            </div>
          ))}
      </div>
    </div>
  );
};

export default OpenAIGenerator;