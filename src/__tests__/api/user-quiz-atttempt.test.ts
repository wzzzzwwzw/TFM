import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import QuizPage from "../page";
import React from "react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "quiz1" }),
  useRouter: () => ({ push: jest.fn() }),
}));

// Mock similarity function
jest.mock("@/lib/utils", () => ({
  similarity: (a: string, b: string) => (a.trim().toLowerCase() === b.trim().toLowerCase() ? 1 : 0),
}));

describe("QuizPage", () => {
  beforeEach(() => {
    // Reset fetch mocks before each test
    global.fetch = jest.fn()
      // First call: fetch quiz
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              quizzes: [
                {
                  id: "quiz1",
                  title: "Sample Quiz",
                  category: "Math",
                  difficulty: "Easy",
                  questions: [
                    { question: "2+2?", answer: "4" },
                    { question: "3+3?", answer: "6" },
                  ],
                },
              ],
            }),
        })
      )
      // Second call: fetch session
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ user: { id: "user1" } }),
        })
      )
      // Third call: save attempt
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true }),
        })
      ) as any;
  });

  it("renders quiz, allows answering, and shows results", async () => {
    render(<QuizPage />);

    // Wait for quiz to load
    expect(await screen.findByText("Sample Quiz")).toBeInTheDocument();

    // Answer first question
    fireEvent.change(screen.getByPlaceholderText("Type your answer..."), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByText("Next"));

    // Answer second question
    fireEvent.change(screen.getByPlaceholderText("Type your answer..."), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByText("Finish"));

    // Wait for results modal
    await waitFor(() => {
      expect(screen.getByText("Quiz Finished!")).toBeInTheDocument();
      expect(screen.getByText("Your answer:")).toBeInTheDocument();
      expect(screen.getByText("Go to Home")).toBeInTheDocument();
    });
  });
});