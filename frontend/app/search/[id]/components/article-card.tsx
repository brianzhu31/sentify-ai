"use client";

import { Article } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <Link href={article?.url} target="_blank" rel="noopener noreferrer">
          <CardTitle
            className="text-xl font-bold truncate overflow-hidden whitespace-nowrap"
            title={article.title}
          >
            {article.title}
          </CardTitle>
        </Link>
        <p className="text-xs text-gray-500 mt-1">
          {article.published_date} | {article.clean_url}
        </p>
      </CardHeader>
      <CardContent className="flex pt-2 flex-grow">
        <div className="w-1/6 aspect-square mr-4 relative flex-shrink-0">
          <Image
            src={article.media}
            alt={article.title}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
        <div className="w-5/6 flex flex-col">
          <p
            className="text-sm text-gray-600 line-clamp-5"
            title={article.compressed_summary}
          >
            {article.compressed_summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
