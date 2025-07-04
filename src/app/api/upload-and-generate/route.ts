import { NextRequest, NextResponse } from "next/server";
import { strict_output } from "@/lib/gptadmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth";
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const contentType = req.headers.get("content-type") || "";
  if (
    !contentType.startsWith("multipart/form-data") &&
    !contentType.startsWith("application/x-www-form-urlencoded")
  ) {
    return NextResponse.json(
      {
        error:
          "Content-Type must be multipart/form-data or application/x-www-form-urlencoded.",
      },
      { status: 400 },
    );
  }
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  // Accept .json or .txt files
  if (
    file.type !== "application/json" &&
    file.type !== "text/plain" &&
    !file.name.endsWith(".json") &&
    !file.name.endsWith(".txt")
  ) {
    return NextResponse.json(
      { error: "Only JSON or TXT files are accepted." },
      { status: 400 },
    );
  }

  const text = await file.text();
  let courseContent = "";

  if (file.type === "application/json" || file.name.endsWith(".json")) {
    try {
      const jsonData = JSON.parse(text);
      // Try to extract course content from common fields, or fallback to the whole JSON string
      courseContent =
        jsonData.content || jsonData.text || JSON.stringify(jsonData) || "";
      if (!courseContent) {
        return NextResponse.json(
          { error: "No course content found in JSON." },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON file." },
        { status: 400 },
      );
    }
  } else {
    // Plain text file
    courseContent = text;
  }

  // Validate course content length
  if (!courseContent || courseContent.trim().length < 10) {
    return NextResponse.json(
      { error: "Course content is too short or missing." },
      { status: 400 },
    );
  }

  console.log("File name:", file.name);
  console.log("Course content sent to OpenAI:", courseContent);

  // Use OpenAI to generate questions and answers from the course content
  const system_prompt = `
You are a quiz generator. Given the following course content, generate exactly 5 questions and answers.
Course content:
${courseContent}
Respond ONLY with a JSON array of 5 objects, each with BOTH "question" and "answer" fields, like this:
[
  {"question": "What is Java?", "answer": "Java is a popular programming language."},
  ...
]
Do not include any explanation, markdown, or extra text. Only output the JSON array.
If you cannot generate a question or answer, use an empty string for that field.
`;

  const output_format = {
    question: "",
    answer: "",
  };

  try {
    let questions = await strict_output(
      system_prompt,
      "", // <--- user prompt is empty, all info is in system prompt
      output_format,
      "",
      false,
      "gpt-3.5-turbo",
      0,
      3,
      false,
    );
    if (!Array.isArray(questions)) questions = [questions];
    return NextResponse.json({ questions });
  } catch (e) {
    return NextResponse.json(
      { questions: [], error: "Failed to generate quiz." },
      { status: 500 },
    );
  }
}
