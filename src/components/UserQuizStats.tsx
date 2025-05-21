"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

type QuizStat = {
  id: string;
  title: string;
  attempts: number;
  averageScore: number | null;
  lastAttempt: string;
};

export default function UserQuizStats() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<QuizStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user-quiz-stats")
        .then(res => res.json())
        .then(data => setStats(data.quizStats || []))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) return <div>Loading stats...</div>;
  if (!session) return <div>Please sign in to see your stats.</div>;

  const totalAttempts = stats.reduce((acc, curr) => acc + curr.attempts, 0);

  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Your Quiz Stats</h2>
      <div className="mb-4">
        <div>Total Attempts: <span className="font-bold">{totalAttempts}</span></div>
      </div>
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Quiz</th>
            <th className="border px-2 py-1">Attempts</th>
            <th className="border px-2 py-1">Avg. Score</th>
            <th className="border px-2 py-1">Last Attempt</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(q => (
            <tr key={q.id}>
              <td className="border px-2 py-1">{q.title}</td>
              <td className="border px-2 py-1">{q.attempts}</td>
              <td className="border px-2 py-1">{q.averageScore !== null ? q.averageScore.toFixed(2) : "N/A"}</td>
              <td className="border px-2 py-1">{q.lastAttempt ? new Date(q.lastAttempt).toLocaleString() : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}