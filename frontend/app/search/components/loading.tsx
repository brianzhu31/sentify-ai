import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface LoadingProps {
  loading: boolean;
}

const totalSteps = 2;

export function Loading({ loading }: LoadingProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    if (loading && currentStep < totalSteps) {
      const timeout = setTimeout(() => {
        setCurrentStep((prevStep) => prevStep + 1);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [loading, currentStep]);

  return (
    <div className="flex flex-col gap-2 min-h-screen items-center justify-center flex-1">
      <Spinner className={cn("size-24")} strokeWidth={0.6}></Spinner>
      {currentStep === 1 && <p className="text-2xl ellipsis">Fetching relevant sources</p>}
      {currentStep === 2 && <p className="text-2xl ellipsis">Performing analysis</p>}
      <p>Please hang tight. This process can take up to 30 seconds.</p>
    </div>
  );
}
