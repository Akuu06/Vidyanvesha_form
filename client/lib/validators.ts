// Zod validation schemas

import { z } from "zod";
import { FormMode, FormStatus, QuestionType, TimerStartMode, LogicAction } from "@/types";
import { VALIDATION_RULES } from "./constants";

// ============================================
// FORM SCHEMAS
// ============================================

export const createFormSchema = z.object({
  title: z.string()
    .min(VALIDATION_RULES.form.title.minLength, "Title must be at least 3 characters")
    .max(VALIDATION_RULES.form.title.maxLength, "Title must not exceed 300 characters"),
  description: z.string()
    .max(VALIDATION_RULES.form.description.maxLength, "Description is too long")
    .optional()
    .default(""),
  mode: z.nativeEnum(FormMode),
  status: z.nativeEnum(FormStatus).optional().default(FormStatus.DRAFT)
});

export const updateFormBasicSchema = z.object({
  title: z.string()
    .min(VALIDATION_RULES.form.title.minLength)
    .max(VALIDATION_RULES.form.title.maxLength),
  description: z.string()
    .max(VALIDATION_RULES.form.description.maxLength)
    .optional(),
  mode: z.nativeEnum(FormMode),
  status: z.nativeEnum(FormStatus)
});

export const formSettingsSchema = z.object({
  // Access Control
  is_public: z.boolean(),
  login_required: z.boolean(),
  allow_anonymous: z.boolean(),
  
  // Time Management
  start_date: z.string().datetime().nullable().optional(),
  end_date: z.string().datetime().nullable().optional(),
  grace_minutes: z.number().min(0).max(120),
  
  // Attempts
  max_attempts: z.number().min(1).max(10),
  cooldown_minutes: z.number().min(0),
  
  // Timer
  time_limit_minutes: z.number().min(1).nullable().optional(),
  timer_starts_on: z.nativeEnum(TimerStartMode),
  auto_submit_on_close: z.boolean(),
  
  // Navigation
  allow_back_navigation: z.boolean(),
  one_question_per_page: z.boolean(),
  show_progress_bar: z.boolean(),
  enable_review_page: z.boolean(),
  
  // Shuffling
  shuffle_questions: z.boolean(),
  shuffle_options_globally: z.boolean(),
  
  // Scoring
  passing_marks: z.number().min(0).max(100).nullable().optional(),
  enable_negative_marking: z.boolean(),
  round_score_to: z.number().min(0).max(4),
  
  // Result Display
  show_result_immediately: z.boolean(),
  show_correct_answers: z.boolean(),
  show_explanations: z.boolean(),
  show_score_breakup: z.boolean(),
  
  // Auto-save
  auto_save_answers: z.boolean(),
  save_interval_seconds: z.number().min(1).max(60),
  
  // Security
  record_ip_address: z.boolean(),
  detect_tab_switch: z.boolean(),
  require_fullscreen: z.boolean(),
  webcam_required: z.boolean(),
  disable_copy_paste: z.boolean()
});

// ============================================
// SECTION SCHEMAS
// ============================================

export const createSectionSchema = z.object({
  title: z.string()
    .min(VALIDATION_RULES.section.title.minLength, "Section title must be at least 2 characters")
    .max(VALIDATION_RULES.section.title.maxLength, "Section title is too long"),
  description: z.string()
    .max(VALIDATION_RULES.section.description.maxLength, "Description is too long")
    .optional()
    .default(""),
  order: z.number().min(0)
});

export const updateSectionSchema = createSectionSchema.extend({
  id: z.number()
});

// ============================================
// QUESTION SCHEMAS
// ============================================

export const questionOptionSchema = z.object({
  id: z.string(),
  text: z.string()
    .min(1, "Option text is required")
    .max(VALIDATION_RULES.question.options.textMaxLength, "Option text is too long"),
  is_correct: z.boolean().optional(),
  order: z.number().optional()
});

export const createQuestionSchema = z.object({
  question_text: z.string()
    .min(VALIDATION_RULES.question.text.minLength, "Question text must be at least 5 characters")
    .max(VALIDATION_RULES.question.text.maxLength, "Question text is too long"),
  question_type: z.nativeEnum(QuestionType),
  options: z.array(questionOptionSchema)
    .min(VALIDATION_RULES.question.options.min, "At least 2 options are required")
    .max(VALIDATION_RULES.question.options.max, "Maximum 10 options allowed")
    .optional(),
  explanation: z.string().max(1000).optional(),
  hint: z.string().max(500).optional(),
  is_required: z.boolean().optional().default(true),
  marks: z.number().min(0).max(100).optional().default(1),
  negative_marks: z.number().min(0).max(100).optional().default(0),
  time_limit_seconds: z.number().min(1).nullable().optional(),
  section: z.number().nullable().optional(),
  order: z.number().min(0)
}).refine(
  (data) => {
    // MCQ questions must have options
    if (data.question_type === QuestionType.MCQ_SINGLE || 
        data.question_type === QuestionType.MCQ_MULTIPLE) {
      return data.options && data.options.length >= VALIDATION_RULES.question.options.min;
    }
    return true;
  },
  {
    message: "MCQ questions must have at least 2 options",
    path: ["options"]
  }
).refine(
  (data) => {
    // MCQ single must have exactly one correct answer
    if (data.question_type === QuestionType.MCQ_SINGLE && data.options) {
      const correctCount = data.options.filter(opt => opt.is_correct).length;
      return correctCount === 1;
    }
    return true;
  },
  {
    message: "Single choice questions must have exactly one correct answer",
    path: ["options"]
  }
).refine(
  (data) => {
    // MCQ multiple must have at least one correct answer
    if (data.question_type === QuestionType.MCQ_MULTIPLE && data.options) {
      const correctCount = data.options.filter(opt => opt.is_correct).length;
      return correctCount >= 1;
    }
    return true;
  },
  {
    message: "Multiple choice questions must have at least one correct answer",
    path: ["options"]
  }
);

export const updateQuestionSchema = createQuestionSchema.extend({
  id: z.number()
});

// ============================================
// ANSWER SCHEMAS
// ============================================

export const submitAnswerSchema = z.object({
  question_id: z.number(),
  answer_text: z.string().nullable().optional(),
  selected_option_ids: z.array(z.string()).nullable().optional(),
  time_spent_seconds: z.number().min(0)
}).refine(
  (data) => {
    // At least one answer field must be provided
    return data.answer_text !== null || 
           (data.selected_option_ids !== null && data.selected_option_ids.length > 0);
  },
  {
    message: "Answer is required",
    path: ["answer_text"]
  }
);

// ============================================
// CONDITIONAL LOGIC SCHEMAS
// ============================================

export const questionLogicSchema = z.object({
  source_question_id: z.number(),
  expected_answer: z.string().min(1, "Expected answer is required"),
  target_question_id: z.number(),
  action: z.nativeEnum(LogicAction)
}).refine(
  (data) => data.source_question_id !== data.target_question_id,
  {
    message: "Source and target questions must be different",
    path: ["target_question_id"]
  }
);

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string()
    .email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters"),
  remember_me: z.boolean().optional().default(false)
});

export const registerSchema = z.object({
  first_name: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  last_name: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  email: z.string()
    .email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirm_password: z.string(),
  role: z.string().optional()
}).refine(
  (data) => data.password === data.confirm_password,
  {
    message: "Passwords don't match",
    path: ["confirm_password"]
  }
);

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormBasicInput = z.infer<typeof updateFormBasicSchema>;
export type FormSettingsInput = z.infer<typeof formSettingsSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
export type QuestionLogicInput = z.infer<typeof questionLogicSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
