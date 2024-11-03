"use client";

import { Article } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "../actions/time";
import { useEffect } from "react";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden max-w-96">
      <Link href={article?.url || ""} target="_blank" rel="noopener noreferrer">
        <CardContent className="p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <div className="w-4 h-4 shrink-0 grow-0 rounded-full overflow-hidden">
              <img
                src={`/icons/news/${article?.clean_url.split(".")[0]}.png`}
                alt={article?.clean_url.split(".")[0]}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/icons/news/newspaper.png";
                }}
              />
            </div>
            <p className="text-sm font-medium leading-tight line-clamp-1">
              {article?.title}
            </p>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {timeAgo(
              typeof article?.published_date === "number"
                ? new Date(article.published_date * 1000)
                : new Date(article?.published_date || "")
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
