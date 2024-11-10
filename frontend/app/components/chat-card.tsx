"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";

export function ChatCard() {
  return (
    <Card className={cn("flex flex-col w-full max-w-[350px] min-w-[240px]")}>
      <CardContent className="flex flex-1 flex-col gap-12 p-4">
        <div className="flex flex-col gap-2">
          <Card className="w-3/4 p-2 bg-muted self-end">
            <p className="text-xs">How is AAPL doing this week?</p>
          </Card>
          <Card className="w-3/4 p-2 bg-primary text-primary-foreground">
            <p className="text-xs">This week, Apple (AAPL) has ...</p>
          </Card>
        </div>
        <div className="flex flex-col gap-2">
          <Card className="w-3/4 p-2 bg-muted self-end">
            <p className="text-xs">Why did TSLA drop so hard yesterday?</p>
          </Card>
          <Card className="w-3/4 p-2 bg-primary text-primary-foreground">
            <p className="text-xs">Tesla&apos;s stock dropped sharply because ...</p>
          </Card>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <p className="font-semibold text-md">AI Finance Assistant</p>
        <p className="text-muted-foreground text-sm">
          Up-to-date answers to finance-related queries, complete with reliable
          data sources
        </p>
      </CardFooter>
    </Card>
  );
}
