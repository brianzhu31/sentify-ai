"use client";

import { Article } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "../actions/time";
import { useEffect } from "react";

interface ArticleCardProps {
  article: any;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden max-w-96">
      <Link href={article?.url || ""} target="_blank" rel="noopener noreferrer">
        <CardContent className="p-0">
          <div className="flex h-12">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={article?.media}
                alt="Thumbnail"
                fill
                className="object-cover"
                quality={1}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="flex-1 p-1 flex flex-col justify-between">
              <h3 className="text-xs font-medium leading-tight line-clamp-1 mb-1">
                {article?.article_title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {timeAgo(new Date(article?.published_date * 1000))}
              </p>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
