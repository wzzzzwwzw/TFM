import MCQ from "@/components/MCQ";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";
import { cookies } from "next/headers";

type Props = {
  params: {
    gameId: string;
  };
};

const MCQPage = async ( props : Props) => {
  const { params } = props;
  const { gameId } = params;

  const session = await getAuthSession();
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "1";
  if (!session?.user && !isAdmin) {
    redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      questions: { 
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });
  if (!game || game.gameType === "open_ended") {
    return redirect("/quiz");
  }
  return <MCQ game={game} />;
};

export default MCQPage;
