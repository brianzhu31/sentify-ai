"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  TooltipProps,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart";
import {
  fetchTimeSeries,
  fetchStockPrice,
} from "../actions/fetch-company-data";
import { TimeSeries, CompanyFull } from "@/types";
import { useWindowSize } from "react-use";

interface TimeRangeOptionProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function TimeRangeOption({ label, selected, onClick }: TimeRangeOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 text-sm font-medium rounded-md transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

const timeRangeOptions = [
  { value: "5day", label: "5D" },
  { value: "month", label: "1M" },
  { value: "6month", label: "6M" },
  { value: "1year", label: "1Y" },
];

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface StockGraphProps {
  ticker: string;
  companyData: CompanyFull | null;
}

export function StockGraph({ ticker, companyData }: StockGraphProps) {
  const [stockPrice, setStockPrice] = useState<number>(0);
  const [timeSeries, setTimeSeries] = useState<TimeSeries | null>(null);
  const [timeRangeOption, setTimeRangeOption] = useState<string>("5day");
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [priceChangePercent, setPriceChangePercent] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { width } = useWindowSize();

  useEffect(() => {
    const getTimeSeries = async () => {
      const fetchTimeSeriesResponse = await fetchTimeSeries(ticker);
      if (fetchTimeSeriesResponse.data) {
        setTimeSeries(fetchTimeSeriesResponse.data);
      }
    };

    const getStockPrice = async () => {
      const fetchStockPriceResponse = await fetchStockPrice(ticker);
      if (fetchStockPriceResponse.data) {
        setStockPrice(fetchStockPriceResponse.data.price);
      }
    };

    Promise.all([getTimeSeries(), getStockPrice()]).then(() =>
      setIsLoading(false)
    );
  }, []);

  useEffect(() => {
    if (timeSeries && stockPrice !== null) {
      const firstPrice = timeSeries[timeRangeOption].values[0].price;
      const currentPrice = stockPrice;

      const diff = currentPrice - firstPrice;
      const percentDiff = (diff / firstPrice) * 100;

      setPriceChange(diff);
      setPriceChangePercent(percentDiff);
    }
  }, [timeRangeOption, timeSeries, stockPrice]);

  function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
    if (active && payload && payload.length) {
      const date = payload[0].payload.datetime;
      const value = payload[0].payload.price;
      return (
        <div
          className={cn(
            "inline-flex items-center gap-2 bg-white rounded-md border border-gray-200 p-2 text-sm"
          )}
        >
          <div
            className="font-medium"
            aria-label={`Stock price: ${value.toFixed(2)} ${
              companyData?.currency
            }`}
          >
            {value.toFixed(2)}{" "}
            <span className="text-gray-500">{companyData?.currency}</span>
          </div>
          <div className="text-gray-400 text-xs" aria-label={`Date: ${date}`}>
            {date}
          </div>
        </div>
      );
    }
    return null;
  }

  if (isLoading) {
    return <></>;
  }

  return (
    <Card className="rounded-md">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{ticker}</CardTitle>
            <CardDescription className="mt-1">
              {companyData?.exchange}
            </CardDescription>
          </div>
          {priceChange && priceChangePercent && (
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold">
                {stockPrice.toFixed(2)} {companyData?.currency}
              </p>
              <p
                className={`${
                  priceChange >= 0 ? "text-green-600" : "text-red-600"
                } text-sm md:text-base lg:text-lg`}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            {timeRangeOptions.map((option) => (
              <TimeRangeOption
                key={option.value}
                label={option.label}
                selected={timeRangeOption === option.value}
                onClick={() => setTimeRangeOption(option.value)}
              />
            ))}
          </div>
        </div>
        {timeSeries && (
          <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
            <LineChart
              accessibilityLayer
              data={timeSeries[timeRangeOption].values}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="datetime"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={
                  width < 768
                    ? Math.floor(timeSeries[timeRangeOption].values.length / 3)
                    : Math.floor(timeSeries[timeRangeOption].values.length / 5)
                }
                tickFormatter={(value) => value.split(" ")[0]}
              />
              <YAxis
                domain={[
                  timeSeries[timeRangeOption].min_price * 0.9,
                  timeSeries[timeRangeOption].max_price * 1.1,
                ]}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "rgba(0,0,0,0.2)", strokeWidth: 2 }}
              />
              <Line
                dataKey="price"
                type="linear"
                stroke="var(--color-price)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
