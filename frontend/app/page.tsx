import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center p-24">
      <p className="text-2xl mb-8">sentify ai</p>
      <div className="flex space-x-4">
        <Link href="/chat">
          <Button>Get Started</Button>
        </Link>
        <Link href="/register">
          <Button>Sign up</Button>
        </Link>
      </div>
    </main>
  );
}
