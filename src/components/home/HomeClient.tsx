"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const categories = [
  { name: "Math", img: "/math.png" },
  { name: "Science", img: "/categories/Science.png" },
  { name: "History", img: "/categories/History.png" },
];
const difficulties = ["easy", "medium", "hard"];

export default function HomeClient() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (difficulty) params.append("difficulty", difficulty);

    fetch(`/api/quiz-review?${params.toString()}`)
      .then(res => res.json())
      .then(data => setQuizzes(Array.isArray(data.quizzes) ? data.quizzes : []))
      .catch(() => setError("Failed to load quizzes."))
      .finally(() => setLoading(false));
  }, [category, difficulty]);

  return (
    <main className="p-8 mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Available Quizzes</h1>
      <div className="flex gap-4 mb-6">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Difficulties</option>
          {difficulties.map(diff => (
            <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
          ))}
        </select>
      </div>
      {loading && <div>Loading quizzes...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && quizzes.length === 0 && <div>No quizzes found.</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz: any) => {
          const cat = categories.find(c => c.name === quiz.category);
          return (
            <div key={quiz.id} className="border rounded-lg p-4 bg-white flex flex-col items-center shadow">
              {cat && (
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={80}
                  height={80}
                  className="mb-2 rounded"
                />
              )}
              <h2 className="text-xl font-bold text-blue-700 mb-1">{quiz.title}</h2>
              <div className="text-gray-600 mb-1">{quiz.category} - {quiz.difficulty}</div>
              <div className="text-sm text-gray-500 mb-2">
                {quiz.questions && Array.isArray(quiz.questions) && (
                  <span>{quiz.questions.length} questions</span>
                )}
              </div>
              <button
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                onClick={() => router.push(`/playme/${quiz.id}`)}
              >
                Start Quiz
              </button>
            </div>
          );
        })}
      </div>
    </main>
  );
}