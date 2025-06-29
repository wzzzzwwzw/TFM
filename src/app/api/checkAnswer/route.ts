import { prisma } from "@/lib/db";
import { checkAnswerSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
//import stringSimilarity from "string-similarity";
import levenshtein from "fast-levenshtein";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { questionId, userInput } = checkAnswerSchema.parse(body);
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
    }
    await prisma.question.update({
      where: { id: questionId },
      data: { userAnswer: userInput },
    });
    if (question.questionType === "mcq") {
      const isCorrect =
        question.answer.toLowerCase().trim() === userInput.toLowerCase().trim();
      await prisma.question.update({
        where: { id: questionId },
        data: { isCorrect },
      });
      return NextResponse.json({
        isCorrect,
      });
    } else if (question.questionType === "open_ended") {
      const correct = question.answer.toLowerCase().trim();
      const user = userInput.toLowerCase().trim();
      const distance = levenshtein.get(correct, user);
      const maxLen = Math.max(correct.length, user.length);

      // Make it stricter: if distance is more than 40% of maxLen, set similarity to 0
      let percentageSimilar = 0;
      if (maxLen === 0) {
        percentageSimilar = 100;
      } else if (distance > maxLen * 0.2) {
        percentageSimilar = 0;
      } else {
        percentageSimilar = Math.round((1 - distance / maxLen) * 100);
      }

      await prisma.question.update({
        where: { id: questionId },
        data: { percentageCorrect: percentageSimilar },
      });
      return NextResponse.json({
        percentageSimilar,
      });
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: error.issues,
        },
        {
          status: 400,
        }
      );
    }
  }
}
