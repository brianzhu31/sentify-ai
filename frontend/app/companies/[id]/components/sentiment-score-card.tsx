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
    <Card className="max-w-72">
      <CardHeader>
        <CardTitle className="text-lg">Financial Sentiment Score</CardTitle>
      </CardHeader>
      <CardContent className="">
        <div className="flex items-baseline mb-4">
          <div className="text-4xl font-bold text-gray-900">
            {normalizedScore.toFixed(1)}
          </div>
          <div className="text-xl text-gray-600 ml-2">/ 5.0</div>
        </div>
        <Progress value={percentage} className="h-2 mb-2" />
      </CardContent>
    </Card>
  );
}
