import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export function Loading() {

  return (
    <div className="flex flex-col gap-2 min-h-screen items-center justify-center flex-1">
      <Spinner className={cn("size-24")} strokeWidth={0.6}></Spinner>
    </div>
  );
}
