"use client";
import React, { useState } from "react";
import QuizUpload from "@/components/admin/QuizUpload";
import QuizReview from "@/components/admin/QuizReview";
import QuizList from "@/components/admin/QuizList";
import QuizStatistics from "@/components/admin/QuizStatistics";
import UserManagement from "@/components/admin/UserManagement";

const AdminDashboardClient = () => {
  const [quizToReview, setQuizToReview] = useState<any>(null);

  const handleQuizReady = (quiz: any) => {
    setQuizToReview(quiz);
  };

  const handleApprove = async (approvedQuiz: any) => {
    await fetch("/api/quiz-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(approvedQuiz),
    });
    setQuizToReview(null);
  };

  return (
    <main className="p-8 mx-auto max-w-7xl">
      <div className="flex items-center">
        <h2 className="mr-2 text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <QuizUpload onQuizReady={handleQuizReady} />
        <QuizStatistics />
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          {quizToReview ? (
            <QuizReview quiz={quizToReview} onApprove={handleApprove} />
          ) : (
            <QuizList />
          )}
        </div>
        <div className="col-span-3">
          <UserManagement />
        </div>
      </div>
    </main>
  );
};

export default AdminDashboardClient;