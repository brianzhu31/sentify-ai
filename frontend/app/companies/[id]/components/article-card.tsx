"use client";

import { Article } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "../actions/time";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className={cn("h-full flex flex-col")}>
      <CardHeader className={cn("pb-2 flex-shrink-0")}>
        <Link href={article?.url} target="_blank" rel="noopener noreferrer">
          <CardTitle
            className={cn(
              "text-xl font-bold truncate overflow-hidden whitespace-nowrap"
            )}
            title={article.title}
          >
            {article.title}
          </CardTitle>
        </Link>
        <div className="flex gap-2">
          <p className="text-xs text-muted-foreground">{article?.clean_url}</p>
          <p className="text-xs text-muted-foreground">
            {typeof article.published_date === "number"
              ? null
              : timeAgo(article.published_date)}
          </p>
        </div>
      </CardHeader>
      <CardContent className={cn("flex pt-2 flex-grow")}>
        <div className="w-1/6 aspect-square mr-4 relative flex-shrink-0">
          <Image
            src={article.media}
            alt={article.title}
            style={{objectFit:"cover"}}
            fill={true}
            quality={30}
            sizes="146px"
            className="rounded-md"
            loading="lazy"
          />
        </div>
        <div className="w-5/6 flex flex-col">
          <p className="text-sm text-gray-600 line-clamp-5">
            {article.compressed_summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
