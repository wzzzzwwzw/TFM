"use client";
import React, { useState } from "react";

const categories = ["Math", "Science", "History"];
const difficulties = ["easy", "medium", "hard"];

export default function QuizReview({
  quiz,
  onApprove,
}: {
  quiz: any;
  onApprove: (quiz: any) => void;
}) {
  const [editedQuiz, setEditedQuiz] = useState(quiz);
  const [category, setCategory] = useState(categories[0]);
  const [difficulty, setDifficulty] = useState(difficulties[0]);

  const handleQuestionChange = (idx: number, value: string) => {
    const updated = { ...editedQuiz };
    if (Array.isArray(updated.questions)) {
      updated.questions[idx].question = value;
    }
    setEditedQuiz(updated);
  };

  const handleAnswerChange = (idx: number, value: string) => {
    const updated = { ...editedQuiz };
    if (Array.isArray(updated.questions)) {
      updated.questions[idx].answer = value;
    }
    setEditedQuiz(updated);
  };

  const questions = Array.isArray(editedQuiz?.questions) ? editedQuiz.questions : [];

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">Review Quiz: {editedQuiz.title}</h2>
      <div className="mb-2">
        <label>Category: </label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="mb-2">
        <label>Difficulty: </label>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          {difficulties.map(diff => (
            <option key={diff}>{diff}</option>
          ))}
        </select>
      </div>
      <div>
        {questions.map((q: any, idx: number) => (
          <div key={idx} className="mb-4">
            <label className="font-semibold">Question {idx + 1}:</label>
            <input
              className="border p-1 w-full mb-1 mt-1"
              value={q.question}
              onChange={e => handleQuestionChange(idx, e.target.value)}
              placeholder="Question"
            />
            <label className="font-semibold">Answer:</label>
            <input
              className="border p-1 w-full mt-1"
              value={q.answer}
              onChange={e => handleAnswerChange(idx, e.target.value)}
              placeholder="Answer"
            />
          </div>
        ))}
      </div>
      <button
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        onClick={() => onApprove({ ...editedQuiz, category, difficulty })}
      >
        Approve & Save
      </button>
    </div>
  );
}