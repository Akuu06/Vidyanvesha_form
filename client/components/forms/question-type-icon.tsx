// Question Type Icon Component

import { QuestionType } from "@/types";
import {
  CircleDot,
  CheckSquare,
  Type,
  AlignLeft,
  Upload,
  Star,
  Calendar,
  Clock
} from "lucide-react";

interface QuestionTypeIconProps {
  type: QuestionType;
  className?: string;
}

export function QuestionTypeIcon({ type, className = "h-4 w-4" }: QuestionTypeIconProps) {
  const icons = {
    [QuestionType.MCQ_SINGLE]: CircleDot,
    [QuestionType.MCQ_MULTIPLE]: CheckSquare,
    [QuestionType.TEXT_SHORT]: Type,
    [QuestionType.TEXT_LONG]: AlignLeft,
    [QuestionType.FILE_UPLOAD]: Upload,
    [QuestionType.RATING]: Star,
    [QuestionType.DATE]: Calendar,
    [QuestionType.TIME]: Clock
  };

  const Icon = icons[type];
  return <Icon className={className} />;
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels = {
    [QuestionType.MCQ_SINGLE]: "Single Choice",
    [QuestionType.MCQ_MULTIPLE]: "Multiple Choice",
    [QuestionType.TEXT_SHORT]: "Short Text",
    [QuestionType.TEXT_LONG]: "Long Text",
    [QuestionType.FILE_UPLOAD]: "File Upload",
    [QuestionType.RATING]: "Rating",
    [QuestionType.DATE]: "Date",
    [QuestionType.TIME]: "Time"
  };

  return labels[type];
}
