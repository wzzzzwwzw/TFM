"use client";
import React, { useEffect, useState } from "react";

const categories = ["Math", "Science", "History"];
const difficulties = ["easy", "medium", "hard"];

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div>
      <div className="mb-4 flex gap-2">
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          {difficulties.map(diff => <option key={diff}>{diff}</option>)}
        </select>
      </div>
      {loading && <div>Loading quizzes...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && quizzes.length === 0 && <div>No quizzes found.</div>}
      <ul>
        {quizzes.map((quiz: any) => (
          <li key={quiz.id} className="mb-2">
            <strong>{quiz.title}</strong> - {quiz.category} - {quiz.difficulty}
            {quiz.questions && Array.isArray(quiz.questions) && (
              <span> ({quiz.questions.length} questions)</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}