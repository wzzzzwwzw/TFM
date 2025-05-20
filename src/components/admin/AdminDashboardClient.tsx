"use client";
import React, { useState } from "react";
import QuizUpload from "@/components/admin/QuizUpload";
import QuizReview from "@/components/admin/QuizReview";
import QuizList from "@/components/admin/QuizList";

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
    <div className="p-8">
      <QuizUpload onQuizReady={handleQuizReady} />
      <div className="mt-8">
        {quizToReview ? (
          <QuizReview quiz={quizToReview} onApprove={handleApprove} />
        ) : (
          <QuizList />
        )}
      </div>
    </div>
  );
};

export default AdminDashboardClient;