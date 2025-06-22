import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass } from "lucide-react";
import { formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";

type Props = {
  timeEnded: Date;
  timeStarted: Date;
};

const TimeTakenCard = ({ timeEnded, timeStarted }: Props) => {
  let content = "In progress";
  if (timeEnded && timeStarted) {
    content = formatTimeDelta(differenceInSeconds(timeEnded, timeStarted));
  }
  return (
    <Card className="md:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold">Time Taken</CardTitle>
        <Hourglass />
      </CardHeader>
      <CardContent>
        <div className="text-sm font-medium">{content}</div>
      </CardContent>
    </Card>
  );
};

export default TimeTakenCard;
