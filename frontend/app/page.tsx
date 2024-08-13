import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            Hi
            <Link href="/login">
                <Button>Sign in</Button>
            </Link>
        </main>
    );
}
