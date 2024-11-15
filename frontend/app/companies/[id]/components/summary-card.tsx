"use client";

import { SummarySection } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ArticleCardSmall from "./article-card-small";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";

interface SumamryCardProps {
  summarySection: SummarySection;
}

export default function SummaryCard({ summarySection }: SumamryCardProps) {
  return (
    <Card className={cn("flex-1 flex-grow rounded-md")}>
      <CardHeader className="flex justify-between relative items-start">
        <CardTitle className="text-lg">{summarySection.header}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {summarySection.paragraphs.map((summaryPoint, index) => (
            <p className="text-sm lg:text-base" key={index}>{summaryPoint}</p>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mt-4 p-2 gap-4">
          {summarySection.sources.map((article, index) => (
            <ArticleCardSmall article={article} key={index} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
