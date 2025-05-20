import { NextRequest, NextResponse } from "next/server";
import { strict_output } from "@/lib/gpt";

export async function POST(req: NextRequest) {
  const { user_prompt } = await req.json();

  const system_prompt = `
You are a quiz generator. Given a topic, generate 5 questions and answers.
Respond ONLY with a JSON array of objects, each with "question" and "answer" fields, like this:
[
  {"question": "...", "answer": "..."},
  ...
]
Do not include any explanation or extra text.
`;

  const output_format = {
    question: "",
    answer: ""
  };

  try {
    let questions = await strict_output(
      system_prompt,
      user_prompt,
      output_format,
      "",
      false,
      "gpt-3.5-turbo",
      0.2, // lower temperature for more predictable output
      3,
      true // verbose logging
    );
    if (!Array.isArray(questions)) {
      questions = [questions];
    }
    return NextResponse.json({ questions });
  } catch (e) {
    return NextResponse.json({ questions: [], error: "Failed to generate quiz." }, { status: 500 });
  }
}