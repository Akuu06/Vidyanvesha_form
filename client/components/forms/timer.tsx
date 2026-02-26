// Timer Component

"use client";

import { useEffect, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { formatTime } from "@/lib/form-utils";
import { cn } from "@/lib/utils";

interface TimerProps {
  totalSeconds: number;
  onTimeUp?: () => void;
  className?: string;
  warningThreshold?: number; // seconds when to show warning
}

export function Timer({ 
  totalSeconds, 
  onTimeUp, 
  className,
  warningThreshold = 300 // 5 minutes
}: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    setTimeRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        if (newTime <= warningThreshold && !isWarning) {
          setIsWarning(true);
        }
        if (newTime <= 0) {
          onTimeUp?.();
          clearInterval(interval);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, onTimeUp, warningThreshold, isWarning]);

  const percentage = (timeRemaining / totalSeconds) * 100;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-2",
        isWarning ? "border-orange-500 bg-orange-50" : "border-border bg-background",
        className
      )}
    >
      {isWarning ? (
        <AlertCircle className="h-4 w-4 text-orange-500" />
      ) : (
        <Clock className="h-4 w-4 text-muted-foreground" />
      )}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Time Remaining</span>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            isWarning && "text-orange-600"
          )}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>
      <div className="ml-2 h-8 w-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000",
            isWarning ? "bg-orange-500" : "bg-primary"
          )}
          style={{ height: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
