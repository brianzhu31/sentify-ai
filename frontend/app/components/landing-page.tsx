"use server";

import { Button } from "@/components/ui/button";
import { ArrowDown, ChevronRight } from "lucide-react";
import { MainGraph } from "./main-graph";
import { StocksCard } from "./stocks-card";
import { SentimentCard } from "./sentiment-card";
import { ChatCard } from "./chat-card";
import { SearchBar } from "./search-bar";
import { Building2, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="h-screen">
        <div className="flex flex-col-reverse h-full lg:flex-row justify-center items-center text-center px-4">
          <div className="flex flex-col gap-4 animate-fade-up w-full max-w-[550px] mb-[30%] lg:mb-0">
            <div>
              <p className="font-bold text-5xl">Market Sentry</p>
              <p className="text-slate-500 text-xl">
                AI-powered financial companion
              </p>
            </div>
            <SearchBar />
          </div>
          <MainGraph />
        </div>
      </section>
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Key Features
          </h2>
          <div className="flex flex-wrap gap-8 justify-center">
            <StocksCard />
            <SentimentCard />
            <ChatCard />
          </div>
        </div>
      </section>
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            Explore
          </h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
            <Button asChild size="lg" className="w-72">
              <Link href="/companies">
                <Building2 className="mr-2 h-5 w-5" />
                View Companies
              </Link>
            </Button>
            <Button asChild size="lg" className="w-72">
              <Link href="/chat">
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat with Finance Assistant
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <footer className="bg-background py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground mb-4 md:mb-0">
            &copy; 2024 All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
