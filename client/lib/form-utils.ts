// Form utility functions

import { FormResponse, FormQuestion, QuestionSnapshot } from "@/types";
import { format, formatDistance, formatDuration, intervalToDuration } from "date-fns";

// ============================================
// TIME FORMATTING
// ============================================

export function formatTime(seconds: number): string {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  if (seconds < 3600) {
    return `${duration.minutes}m ${duration.seconds}s`;
  }
  
  return `${duration.hours}h ${duration.minutes}m`;
}

export function formatTimeVerbose(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "MMM dd, yyyy hh:mm a");
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM dd, yyyy");
}

export function formatRelativeTime(dateString: string): string {
  return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
}

// ============================================
// SCORE CALCULATION
// ============================================

export function calculateScore(
  questions: FormQuestion[],
  answers: Record<number, { 
    selected_option_ids?: string[] | null; 
    answer_text?: string | null;
    is_correct?: boolean | null;
  }>
): { totalScore: number; maxScore: number; percentage: number } {
  let totalScore = 0;
  let maxScore = 0;
  
  questions.forEach(question => {
    maxScore += question.marks;
    
    const answer = answers[question.id];
    if (!answer) return;
    
    if (answer.is_correct === true) {
      totalScore += question.marks;
    } else if (answer.is_correct === false) {
      totalScore -= question.negative_marks;
    }
  });
  
  // Ensure score doesn't go below 0
  totalScore = Math.max(0, totalScore);
  
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    maxScore,
    percentage: Math.round(percentage * 100) / 100
  };
}

export function roundScore(score: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(score * multiplier) / multiplier;
}

// ============================================
// ANSWER VALIDATION
// ============================================

export function validateAnswer(
  question: QuestionSnapshot,
  answer: {
    selected_option_ids?: string[] | null;
    answer_text?: string | null;
  }
): { isValid: boolean; isEmpty: boolean } {
  let isEmpty = false;
  let isValid = true;
  
  switch (question.question_type) {
    case "mcq_single":
    case "mcq_multiple":
      isEmpty = !answer.selected_option_ids || answer.selected_option_ids.length === 0;
      break;
      
    case "text_short":
    case "text_long":
      isEmpty = !answer.answer_text || answer.answer_text.trim() === "";
      break;
      
    case "file_upload":
      // File validation would happen separately
      isEmpty = false;
      break;
      
    default:
      isEmpty = !answer.answer_text || answer.answer_text.trim() === "";
  }
  
  return { isValid, isEmpty };
}

export function checkMCQAnswer(
  question: QuestionSnapshot,
  selectedOptionIds: string[]
): boolean {
  if (!question.options_snapshot) return false;
  
  const correctOptions = question.options_snapshot
    .filter(opt => opt.is_correct)
    .map(opt => opt.id);
    
  if (selectedOptionIds.length !== correctOptions.length) return false;
  
  return selectedOptionIds.every(id => correctOptions.includes(id));
}

// ============================================
// QUESTION PROGRESS
// ============================================

export function calculateProgress(
  totalQuestions: number,
  answeredQuestions: number
): number {
  if (totalQuestions === 0) return 0;
  return Math.round((answeredQuestions / totalQuestions) * 100);
}

export function getQuestionStatus(
  questionId: number,
  answers: Record<number, any>,
  isRequired: boolean
): "answered" | "skipped" | "unanswered" {
  const answer = answers[questionId];
  
  if (!answer) return "unanswered";
  
  const { isEmpty } = validateAnswer(answer.snapshot, answer);
  
  if (isEmpty) {
    return isRequired ? "unanswered" : "skipped";
  }
  
  return "answered";
}

// ============================================
// FORM VALIDATION
// ============================================

export function validateFormSubmission(
  questions: FormQuestion[],
  answers: Record<number, any>
): { isValid: boolean; missingRequired: number[] } {
  const requiredQuestions = questions.filter(q => q.is_required);
  const missingRequired: number[] = [];
  
  requiredQuestions.forEach(question => {
    const answer = answers[question.id];
    if (!answer || !answer.snapshot) {
      missingRequired.push(question.id);
      return;
    }
    
    const { isEmpty } = validateAnswer(answer.snapshot, answer);
    if (isEmpty) {
      missingRequired.push(question.id);
    }
  });
  
  return {
    isValid: missingRequired.length === 0,
    missingRequired
  };
}

// ============================================
// ATTEMPT VALIDATION
// ============================================

export function canAttemptForm(
  maxAttempts: number,
  currentAttempts: number,
  lastAttemptTime: string | null,
  cooldownMinutes: number
): { canAttempt: boolean; reason?: string; timeRemaining?: number } {
  // Check max attempts
  if (currentAttempts >= maxAttempts) {
    return {
      canAttempt: false,
      reason: `You have reached the maximum number of attempts (${maxAttempts})`
    };
  }
  
  // Check cooldown period
  if (lastAttemptTime && cooldownMinutes > 0) {
    const lastAttempt = new Date(lastAttemptTime);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastAttempt.getTime()) / (1000 * 60);
    
    if (diffMinutes < cooldownMinutes) {
      const timeRemaining = Math.ceil(cooldownMinutes - diffMinutes);
      return {
        canAttempt: false,
        reason: `Please wait ${timeRemaining} minutes before attempting again`,
        timeRemaining
      };
    }
  }
  
  return { canAttempt: true };
}

export function isFormActive(
  startDate: string | null,
  endDate: string | null,
  graceMinutes: number = 0
): { isActive: boolean; reason?: string; startsIn?: number; endedAgo?: number } {
  const now = new Date();
  
  // Check start date
  if (startDate) {
    const start = new Date(startDate);
    if (now < start) {
      const diffMinutes = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60));
      return {
        isActive: false,
        reason: `Form starts in ${diffMinutes} minutes`,
        startsIn: diffMinutes
      };
    }
  }
  
  // Check end date with grace period
  if (endDate) {
    const end = new Date(endDate);
    const endWithGrace = new Date(end.getTime() + graceMinutes * 60 * 1000);
    
    if (now > endWithGrace) {
      const diffMinutes = Math.ceil((now.getTime() - endWithGrace.getTime()) / (1000 * 60));
      return {
        isActive: false,
        reason: "Form has closed",
        endedAgo: diffMinutes
      };
    }
  }
  
  return { isActive: true };
}

// ============================================
// SHUFFLE UTILITIES
// ============================================

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function shuffleQuestions(questions: FormQuestion[]): FormQuestion[] {
  return shuffleArray(questions).map((q, index) => ({
    ...q,
    order: index + 1
  }));
}

export function shuffleOptions(snapshot: QuestionSnapshot): QuestionSnapshot {
  if (!snapshot.options_snapshot || snapshot.options_snapshot.length === 0) {
    return snapshot;
  }
  
  return {
    ...snapshot,
    options_snapshot: shuffleArray(snapshot.options_snapshot)
  };
}

// ============================================
// TEXT UTILITIES
// ============================================

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
}

// ============================================
// SORTING UTILITIES
// ============================================

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

export function reorderItems<T extends { order: number }>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // Update order values
  return result.map((item, index) => ({
    ...item,
    order: index + 1
  }));
}
