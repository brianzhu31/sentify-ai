"use client";

import { Article } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ExternalLinkIcon,
  PlusCircledIcon,
  MinusCircledIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

type SummaryPoint = {
  value: string;
  source: Article;
};

interface SummaryCardProps {
  sentimentLabel: string;
  summaryPoints: SummaryPoint[];
}

export default function SummaryCard({
  sentimentLabel,
  summaryPoints,
}: SummaryCardProps) {
  return (
    <Card className={cn("max-w-4xl flex-1 flex-grow rounded-md")}>
      <CardHeader className="flex justify-between relative items-start">
        <CardTitle>{sentimentLabel} Points</CardTitle>
        <div className="absolute top-4 right-8">
          {sentimentLabel === "Positive" ? (
            <PlusCircledIcon className="h-7 w-7 text-green-800" />
          ) : sentimentLabel === "Negative" ? (
            <MinusCircledIcon className="h-7 w-7 text-red-700" />
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex-col">
          {summaryPoints &&
            summaryPoints.map((summaryPoint, index) => (
              <div key={index}>
                <p className="mb-6">
                  {summaryPoint.value}{" "}
                  <span className="inline-block">
                    <Popover>
                      <PopoverTrigger>
                        <ExternalLinkIcon cursor="pointer" />
                      </PopoverTrigger>
                      <PopoverContent>
                        <Link
                          href={summaryPoint.source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <p className="text-sm mb-2">
                            {summaryPoint.source.title}
                          </p>
                        </Link>
                        <p className="text-xs">
                          {summaryPoint.source.clean_url}
                        </p>
                      </PopoverContent>
                    </Popover>
                  </span>
                </p>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
