"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const categories = [
  { name: "Math", img: "/math.png" },
  { name: "Science", img: "/categories/Science.png" },
  { name: "History", img: "/categories/History.png" },
  { name: "Programming",img: "/categories/image--programming.svg"}, // Use SVG component for Geography
];

export default function HomeClient() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/quiz-review")
      .then((res) => res.json())
      .then((data) => {
        setQuizzes(data.quizzes || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error loading quizzes.");
        setLoading(false);
      });
  }, []);

  const filteredQuizzes = selectedCategory
    ? quizzes.filter((quiz: any) => quiz.category === selectedCategory)
    : quizzes;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Available Quizzes</h1>

      {/* Category Filter */}
      <div className="mb-6 flex gap-4">
        <label htmlFor="category" className="font-semibold">
          Category:
        </label>
        <select
          id="category"
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="border rounded px-2 py-1"
        >
          <option value="">All</option>
          {categories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading and Error Messages */}
      {loading && <div>Loading quizzes...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {/* Quiz List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz: any) => {
          const cat = categories.find((c) => c.name === quiz.category);
          return (
            <div
              key={quiz.id}
              className="border rounded-lg p-4 flex flex-col items-center shadow hover:shadow-lg transition"
            >
              {cat && cat.img ? (
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={80}
                  height={80}
                  className="mb-2 rounded"
                />
              ) : null}
              <h2 className="text-xl font-semibold mb-1">{quiz.title}</h2>
              <div className="text-gray-600 mb-1">
                Category: {quiz.category}
              </div>
              <div className="text-gray-600 mb-1">
                Difficulty: {quiz.difficulty}
              </div>
              <div className="text-gray-600 mb-3">
                Questions: {quiz.questions?.length || 0}
              </div>
              <a
                href={`/playme/${quiz.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Start Quiz
              </a>
            </div>
          );
        })}
      </div>

      {/* No quizzes found */}
      {!loading && filteredQuizzes.length === 0 && (
        <div className="mt-8 text-gray-500">No quizzes found.</div>
      )}
    </div>
  );
}