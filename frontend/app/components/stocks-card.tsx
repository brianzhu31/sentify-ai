"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { animate, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function StocksCard() {
  return (
    <Card className={cn("flex flex-col w-full max-w-[350px] min-w-[240px]")}>
      <CardContent className="h-full">
        <div className="h-full bg-neutral-200 dark:bg-[rgba(40,40,40,0.70)] [mask-image:radial-gradient(50%_50%_at_50%_50%,white_0%,transparent_100%)]">
          <Skeleton />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <p className="font-semibold text-md">Company Analytics</p>
        <p className="text-muted-foreground text-sm">
          Get valuable insights and summaries about top companies across the world
        </p>
      </CardFooter>
    </Card>
  );
}

const Skeleton = () => {
  return (
    <div className="overflow-hidden h-full relative flex items-center justify-center">
      <div className="flex flex-row justify-center items-center gap-2">
        <Container className="h-8 w-8 circle-1">
          <CompanyLogo ticker="AAPL" />
        </Container>
        <Container className="h-12 w-12 circle-2">
          <CompanyLogo ticker="MSFT" />
        </Container>
        <Container className="circle-3">
          <CompanyLogo ticker="NVDA" />
        </Container>
        <Container className="h-12 w-12 circle-4">
          <CompanyLogo ticker="META" />
        </Container>
        <Container className="h-8 w-8 circle-5">
          <CompanyLogo ticker="AMZN" />
        </Container>
      </div>
    </div>
  );
};

const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        `rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
    shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]
    `,
        className
      )}
    >
      {children}
    </div>
  );
};

const CompanyLogo = ({ ticker }: { ticker: string }) => {
  return (
    <div>
      <img
        className="rounded-full"
        src={`/icons/small/${ticker}.svg`}
        alt="My Icon"
        width="56"
        height="56"
      />
    </div>
  );
};
