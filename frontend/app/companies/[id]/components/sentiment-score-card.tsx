"use client";

import { Article } from "@/types";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SentimentScoreCard {
  score: number;
}

export default function SentimentScoreCard({ score }: SentimentScoreCard) {
  const normalizedScore = Math.max(0, Math.min(5, score));
  const percentage = (normalizedScore / 5) * 100;

  return (
    <Card className="w-full max-w-[200px] sm:max-w-[18rem] md:max-w-[20rem] lg:max-w-[22rem]">
      <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
        <CardTitle className="text-xs sm:text-sm md:text-md lg:text-lg">
          Financial Sentiment Score
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 pt-0 sm:pt-0 md:pt-0 lg:pt-0">
        <div className="flex items-baseline mb-2 sm:mb-3 md:mb-4">
          <div className="text-md sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            {normalizedScore.toFixed(1)}
          </div>
          <div className="text-xs sm:text-s md:text-md lg:text-lg text-gray-600 ml-1 sm:ml-2">
            / 5.0
          </div>
        </div>
        <Progress value={percentage} className="h-1 sm:h-1.5 md:h-2" />
      </CardContent>
    </Card>
  );
}
