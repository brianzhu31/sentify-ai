"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export const description = "A radial chart with stacked sections";

const chartData = [{ positive: 7, negative: 3 }];

const chartConfig = {
  positive: {
    label: "Positive",
    color: "hsl(var(--chart-2))",
  },
  negative: {
    label: "Negative",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function SentimentCard() {
  return (
    <Card className={cn("flex flex-col w-full min-h-[380px] max-w-[350px] min-w-[240px]")}>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px] mt-12"
        >
          <RadialBarChart
            data={chartData}
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="100%"
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {3.5}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Score
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="positive"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-positive)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="negative"
              fill="var(--color-negative)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <p className="font-semibold text-md">Financial Sentiment Analysis</p>
        <p className="text-muted-foreground text-sm">
          Discover trends and market sentiment from recent financial news and stories
        </p>
      </CardFooter>
    </Card>
  );
}
