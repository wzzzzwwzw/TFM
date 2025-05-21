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

  // Placeholder handlers for actions
  const handleView = (quiz: any) => {
    alert(`View quiz: ${quiz.title}`);
  };
  const handleEdit = (quiz: any) => {
    alert(`Edit quiz: ${quiz.title}`);
  };
  const handleDelete = (quiz: any) => {
    if (window.confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      // Implement delete logic here
      setQuizzes(qs => qs.filter(q => q.id !== quiz.id));
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow border">
      <div className="mb-4 flex gap-4 items-center">
        <select
          className="border rounded px-2 py-1"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>
        <select
          className="border rounded px-2 py-1"
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          {difficulties.map(diff => <option key={diff}>{diff}</option>)}
        </select>
      </div>
      {loading && <div>Loading quizzes...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && quizzes.length === 0 && <div>No quizzes found.</div>}
      {!loading && quizzes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-2 border">#</th>
                <th className="p-2 border text-left">Title</th>
                <th className="p-2 border text-left">Category</th>
                <th className="p-2 border text-left">Difficulty</th>
                <th className="p-2 border text-center">Questions</th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz: any, idx: number) => (
                <tr key={quiz.id} className="hover:bg-blue-50">
                  <td className="p-2 border text-center">{idx + 1}</td>
                  <td className="p-2 border">{quiz.title}</td>
                  <td className="p-2 border">{quiz.category}</td>
                  <td className="p-2 border">{quiz.difficulty}</td>
                  <td className="p-2 border text-center">
                    {quiz.questions && Array.isArray(quiz.questions)
                      ? quiz.questions.length
                      : 0}
                  </td>
                  <td className="p-2 border text-center space-x-2">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      onClick={() => handleView(quiz)}
                    >
                      View
                    </button>
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                      onClick={() => handleEdit(quiz)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      onClick={() => handleDelete(quiz)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}