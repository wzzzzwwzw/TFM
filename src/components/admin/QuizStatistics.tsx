"use client";
import React, { useEffect, useState } from "react";

type QuizStatistic = {
  quizId: string;
  quizTitle: string;
  attempts: number;
  averageScore: number;
  completionRate?: number; // Optional
};

const QuizStatistics = () => {
  const [statistics, setStatistics] = useState<QuizStatistic[]>([]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch("/api/quiz-statistics");
        const data = await response.json();
        setStatistics(data);
      } catch (error) {
        console.error("Error fetching quiz statistics:", error);
      }
    };

    fetchStatistics();
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Quiz Statistics</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Quiz Title</th>
            <th className="border border-gray-300 px-4 py-2">Attempts</th>
            <th className="border border-gray-300 px-4 py-2">Average Score</th>
            <th className="border border-gray-300 px-4 py-2">
              Completion Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {statistics.map((stat) => (
            <tr key={`${stat.quizId}-${stat.quizTitle}`}>
              <td className="border border-gray-300 px-4 py-2">
                {stat.quizTitle}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {stat.attempts}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {stat.averageScore}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {stat.completionRate !== undefined
                  ? `${stat.completionRate}%`
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuizStatistics;
