import * as React from "react";
import { cn } from "@/lib/utils";

interface StepsProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  }[];
  currentStep?: number;
  className?: string;
}

export function Steps({
  items,
  currentStep = items.length, // Default to all steps being complete
  className,
  ...props
}: StepsProps) {
  return (
    <div className={cn("flex flex-col space-y-8", className)} {...props}>
      {items.map((item, index) => {
        const stepCompleted = index < currentStep;
        const isCurrentStep = index === currentStep - 1;
        const isLastStep = items.length === index + 1;

        return (
          <div key={index} className="flex items-start">
            {/* Step circle */}
            <div className="relative flex items-center justify-center">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                  stepCompleted
                    ? "border-lootopia-gold bg-lootopia-gold text-background"
                    : "border-muted bg-muted/50 text-muted-foreground",
                )}
              >
                {item.icon || (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Connecting line */}
              {!isLastStep && (
                <div
                  className={cn(
                    "absolute top-10 left-1/2 h-full w-0.5 -translate-x-1/2",
                    stepCompleted ? "bg-lootopia-gold" : "bg-muted",
                  )}
                />
              )}
            </div>

            {/* Step content */}
            <div className="ml-4 pb-8 pt-1">
              <h3
                className={cn(
                  "text-xl font-medium",
                  isCurrentStep ? "text-foreground" : "text-foreground/80",
                )}
              >
                {item.title}
              </h3>
              <p
                className={cn(
                  "mt-1",
                  isCurrentStep
                    ? "text-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
