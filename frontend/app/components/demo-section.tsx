import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DemoSectionProps {
  header: string;
  description: string;
  redirect: string;
  videoUrl: string;
}

export const DemoSection = ({
  header,
  description,
  redirect,
  videoUrl,
}: DemoSectionProps) => {
  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr,1.5fr] lg:gap-12 xl:gap-16">
        <div className="flex flex-col justify-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl">
            {header}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {description}
          </p>
          <Link href={redirect}>
            <Button className="w-full max-w-64">Try Now</Button>
          </Link>
        </div>
        <div className="flex items-center justify-center lg:justify-end shadow-2xl">
          <div className="w-full" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={videoUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-md"
              title="chat-demo"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};
