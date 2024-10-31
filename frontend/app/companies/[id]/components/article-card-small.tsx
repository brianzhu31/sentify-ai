"use client";

import { Article } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { timeAgo } from "../actions/time";

interface ArticleCardSmallProps {
  article: Article;
}

export default function ArticleCardSmall({ article }: ArticleCardSmallProps) {
  return (
    <Card className="overflow-hidden max-w-96">
      <Link href={article?.url || ""} target="_blank" rel="noopener noreferrer">
        <CardContent className="p-3 space-y-2">
          <p className="text-sm font-medium leading-tight line-clamp-2">
            {article?.title}
          </p>
          <div className="flex items-center text-xs text-muted-foreground">
            {timeAgo(
              typeof article?.published_date === "number"
                ? new Date(article.published_date * 1000)
                : new Date(article?.published_date || '')
            )}
          </div>
          <div className="flex items-center">
            <div className="relative w-4 h-4 mr-2">
              <img
                src={`/icons/news/${article?.clean_url.split('.')[0]}.png`}
                alt={article?.clean_url.split('.')[0]}
                className="object-contain rounded-lg"
                onError={(e) => (e.currentTarget.src = "/icons/news/newspaper.png")}
              />
            </div>
            <span className="text-xs text-muted-foreground flex items-center">
              {article?.clean_url}
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
