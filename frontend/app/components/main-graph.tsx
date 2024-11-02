"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";

export const description = "An interactive line chart";

const chartData = [
  { price: 83.041, datetime: "2024-05-01" },
  { price: 85.817, datetime: "2024-05-02" },
  { price: 88.789, datetime: "2024-05-03" },
  { price: 92.14, datetime: "2024-05-06" },
  { price: 90.554, datetime: "2024-05-07" },
  { price: 90.412, datetime: "2024-05-08" },
  { price: 88.747, datetime: "2024-05-09" },
  { price: 89.878, datetime: "2024-05-10" },
  { price: 90.399, datetime: "2024-05-13" },
  { price: 91.356, datetime: "2024-05-14" },
  { price: 94.63, datetime: "2024-05-15" },
  { price: 94.359, datetime: "2024-05-16" },
  { price: 92.479, datetime: "2024-05-17" },
  { price: 94.78, datetime: "2024-05-20" },
  { price: 95.386, datetime: "2024-05-21" },
  { price: 94.95, datetime: "2024-05-22" },
  { price: 103.799, datetime: "2024-05-23" },
  { price: 106.469, datetime: "2024-05-24" },
  { price: 113.901, datetime: "2024-05-28" },
  { price: 114.825, datetime: "2024-05-29" },
  { price: 110.5, datetime: "2024-05-30" },
  { price: 109.633, datetime: "2024-05-31" },
  { price: 115, datetime: "2024-06-03" },
  { price: 116.437, datetime: "2024-06-04" },
  { price: 122.44, datetime: "2024-06-05" },
  { price: 120.998, datetime: "2024-06-06" },
  { price: 120.888, datetime: "2024-06-07" },
  { price: 121.79, datetime: "2024-06-10" },
  { price: 120.91, datetime: "2024-06-11" },
  { price: 125.2, datetime: "2024-06-12" },
  { price: 129.61, datetime: "2024-06-13" },
  { price: 131.88, datetime: "2024-06-14" },
  { price: 130.98, datetime: "2024-06-17" },
  { price: 135.58, datetime: "2024-06-18" },
  { price: 130.78, datetime: "2024-06-20" },
  { price: 126.57, datetime: "2024-06-21" },
  { price: 118.11, datetime: "2024-06-24" },
  { price: 126.09, datetime: "2024-06-25" },
  { price: 126.4, datetime: "2024-06-26" },
  { price: 123.99, datetime: "2024-06-27" },
  { price: 123.54, datetime: "2024-06-28" },
  { price: 124.3, datetime: "2024-07-01" },
  { price: 122.67, datetime: "2024-07-02" },
  { price: 128.28, datetime: "2024-07-03" },
  { price: 125.83, datetime: "2024-07-05" },
  { price: 128.2, datetime: "2024-07-08" },
  { price: 131.38, datetime: "2024-07-09" },
  { price: 134.91, datetime: "2024-07-10" },
  { price: 127.4, datetime: "2024-07-11" },
  { price: 129.24001, datetime: "2024-07-12" },
  { price: 128.44, datetime: "2024-07-15" },
  { price: 126.36, datetime: "2024-07-16" },
  { price: 117.99, datetime: "2024-07-17" },
  { price: 121.09, datetime: "2024-07-18" },
  { price: 117.93, datetime: "2024-07-19" },
  { price: 123.54, datetime: "2024-07-22" },
  { price: 122.59, datetime: "2024-07-23" },
  { price: 114.25, datetime: "2024-07-24" },
  { price: 112.28, datetime: "2024-07-25" },
  { price: 113.06, datetime: "2024-07-26" },
  { price: 111.59, datetime: "2024-07-29" },
  { price: 103.73, datetime: "2024-07-30" },
  { price: 117.02, datetime: "2024-07-31" },
  { price: 109.21, datetime: "2024-08-01" },
  { price: 107.27, datetime: "2024-08-02" },
  { price: 100.45, datetime: "2024-08-05" },
  { price: 104.25, datetime: "2024-08-06" },
  { price: 98.91, datetime: "2024-08-07" },
  { price: 104.97, datetime: "2024-08-08" },
  { price: 104.75, datetime: "2024-08-09" },
  { price: 109.02, datetime: "2024-08-12" },
  { price: 116.14, datetime: "2024-08-13" },
  { price: 118.08, datetime: "2024-08-14" },
  { price: 122.86, datetime: "2024-08-15" },
  { price: 124.58, datetime: "2024-08-16" },
  { price: 130, datetime: "2024-08-19" },
  { price: 127.25, datetime: "2024-08-20" },
  { price: 128.5, datetime: "2024-08-21" },
  { price: 123.74, datetime: "2024-08-22" },
  { price: 129.37, datetime: "2024-08-23" },
  { price: 126.46, datetime: "2024-08-26" },
  { price: 128.3, datetime: "2024-08-27" },
  { price: 125.61, datetime: "2024-08-28" },
  { price: 117.59, datetime: "2024-08-29" },
  { price: 119.37, datetime: "2024-08-30" },
  { price: 108, datetime: "2024-09-03" },
  { price: 106.21, datetime: "2024-09-04" },
  { price: 107.21, datetime: "2024-09-05" },
  { price: 102.83, datetime: "2024-09-06" },
  { price: 106.47, datetime: "2024-09-09" },
  { price: 108.1, datetime: "2024-09-10" },
  { price: 116.91, datetime: "2024-09-11" },
  { price: 119.14, datetime: "2024-09-12" },
  { price: 119.1, datetime: "2024-09-13" },
  { price: 116.78, datetime: "2024-09-16" },
  { price: 115.59, datetime: "2024-09-17" },
  { price: 113.37, datetime: "2024-09-18" },
  { price: 117.87, datetime: "2024-09-19" },
  { price: 116, datetime: "2024-09-20" },
  { price: 116.26, datetime: "2024-09-23" },
  { price: 120.87, datetime: "2024-09-24" },
  { price: 123.51, datetime: "2024-09-25" },
  { price: 124.04, datetime: "2024-09-26" },
  { price: 121.4, datetime: "2024-09-27" },
  { price: 121.44, datetime: "2024-09-30" },
  { price: 117, datetime: "2024-10-01" },
  { price: 118.85, datetime: "2024-10-02" },
  { price: 122.85, datetime: "2024-10-03" },
  { price: 124.92, datetime: "2024-10-04" },
  { price: 127.72, datetime: "2024-10-07" },
  { price: 132.89, datetime: "2024-10-08" },
  { price: 132.64999, datetime: "2024-10-09" },
  { price: 134.81, datetime: "2024-10-10" },
  { price: 134.8, datetime: "2024-10-11" },
  { price: 138.07001, datetime: "2024-10-14" },
  { price: 131.60001, datetime: "2024-10-15" },
  { price: 135.72, datetime: "2024-10-16" },
  { price: 136.92999, datetime: "2024-10-17" },
  { price: 138, datetime: "2024-10-18" },
  { price: 143.71001, datetime: "2024-10-21" },
  { price: 143.59, datetime: "2024-10-22" },
  { price: 139.56, datetime: "2024-10-23" },
  { price: 140.41, datetime: "2024-10-24" },
  { price: 141.53999, datetime: "2024-10-25" },
];

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function MainGraph() {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-full max-h-[300px] w-full max-w-[600px]"
    >
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} horizontal={false} />
        <YAxis domain={[70, 150]} tick={false} />
        <XAxis tick={false} />
        <Line
          dataKey={"price"}
          type="monotone"
          stroke={`var(--color-price)`}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
