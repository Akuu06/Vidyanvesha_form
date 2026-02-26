// Constants for Form Management System

import { FormMode, FormStatus, QuestionType, TimerStartMode, LogicAction, UserRole } from "@/types";

// ============================================
// FORM CONSTANTS
// ============================================

export const FORM_MODES = [
  { value: FormMode.NORMAL_FORM, label: "Normal Form" },
  { value: FormMode.QUIZ, label: "Quiz/Test" }
] as const;

export const FORM_STATUSES = [
  { value: FormStatus.DRAFT, label: "Draft", color: "gray" },
  { value: FormStatus.PUBLISHED, label: "Published", color: "green" },
  { value: FormStatus.CLOSED, label: "Closed", color: "red" }
] as const;

export const TIMER_START_MODES = [
  { value: TimerStartMode.OPEN, label: "On Form Open" },
  { value: TimerStartMode.FIRST_QUESTION, label: "On First Question" }
] as const;

// ============================================
// QUESTION CONSTANTS
// ============================================

export const QUESTION_TYPES = [
  { 
    value: QuestionType.MCQ_SINGLE, 
    label: "Multiple Choice (Single Answer)",
    icon: "circle-dot"
  },
  { 
    value: QuestionType.MCQ_MULTIPLE, 
    label: "Multiple Choice (Multiple Answers)",
    icon: "check-square"
  },
  { 
    value: QuestionType.TEXT_SHORT, 
    label: "Short Text Answer",
    icon: "text"
  },
  { 
    value: QuestionType.TEXT_LONG, 
    label: "Long Text Answer (Essay)",
    icon: "align-left"
  },
  { 
    value: QuestionType.FILE_UPLOAD, 
    label: "File Upload",
    icon: "upload"
  },
  { 
    value: QuestionType.RATING, 
    label: "Rating Scale",
    icon: "star"
  },
  { 
    value: QuestionType.DATE, 
    label: "Date Picker",
    icon: "calendar"
  },
  { 
    value: QuestionType.TIME, 
    label: "Time Picker",
    icon: "clock"
  }
] as const;

export const LOGIC_ACTIONS = [
  { value: LogicAction.SHOW, label: "Show Question" },
  { value: LogicAction.HIDE, label: "Hide Question" },
  { value: LogicAction.JUMP_SECTION, label: "Jump to Section" },
  { value: LogicAction.JUMP_QUESTION, label: "Jump to Question" }
] as const;

// ============================================
// USER ROLES
// ============================================

export const USER_ROLES = [
  { value: UserRole.SUPER_ADMIN, label: "Super Admin" },
  { value: UserRole.ADMIN, label: "Admin" },
  { value: UserRole.TEACHER, label: "Teacher" },
  { value: UserRole.STUDENT, label: "Student" },
  { value: UserRole.GUEST, label: "Guest" }
] as const;

// ============================================
// DEFAULT FORM SETTINGS
// ============================================

export const DEFAULT_FORM_SETTINGS = {
  mode: FormMode.NORMAL_FORM,
  status: FormStatus.DRAFT,
  is_public: true,
  login_required: false,
  allow_anonymous: false,
  
  start_date: null,
  end_date: null,
  grace_minutes: 0,
  
  max_attempts: 1,
  cooldown_minutes: 0,
  
  time_limit_minutes: null,
  timer_starts_on: TimerStartMode.OPEN,
  auto_submit_on_close: false,
  
  allow_back_navigation: true,
  one_question_per_page: false,
  show_progress_bar: true,
  enable_review_page: true,
  
  shuffle_questions: false,
  shuffle_options_globally: false,
  
  passing_marks: null,
  enable_negative_marking: false,
  round_score_to: 2,
  
  show_result_immediately: true,
  show_correct_answers: true,
  show_explanations: true,
  show_score_breakup: true,
  
  auto_save_answers: true,
  save_interval_seconds: 5,
  
  record_ip_address: false,
  detect_tab_switch: false,
  require_fullscreen: false,
  webcam_required: false,
  disable_copy_paste: false
} as const;

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION_RULES = {
  form: {
    title: {
      minLength: 3,
      maxLength: 300
    },
    description: {
      maxLength: 5000
    }
  },
  section: {
    title: {
      minLength: 2,
      maxLength: 200
    },
    description: {
      maxLength: 2000
    }
  },
  question: {
    text: {
      minLength: 5,
      maxLength: 2000
    },
    options: {
      min: 2,
      max: 10,
      textMaxLength: 500
    }
  }
} as const;

// ============================================
// UI CONSTANTS
// ============================================

export const ITEMS_PER_PAGE = 10;

export const DATE_FORMAT = "MMM dd, yyyy";
export const TIME_FORMAT = "hh:mm a";
export const DATETIME_FORMAT = "MMM dd, yyyy hh:mm a";

export const DEBOUNCE_DELAY = 300; // ms
export const AUTO_SAVE_INTERVAL = 5000; // ms

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// ============================================
// NAVIGATION
// ============================================

export const ADMIN_NAV_ITEMS = [
  { label: "Forms", href: "/forms", icon: "file-text" },
  { label: "Responses", href: "/responses", icon: "inbox" },
  { label: "Analytics", href: "/analytics", icon: "bar-chart" },
  { label: "Settings", href: "/settings", icon: "settings" }
] as const;

// ============================================
// MESSAGES
// ============================================

export const MESSAGES = {
  form: {
    created: "Form created successfully",
    updated: "Form updated successfully",
    deleted: "Form deleted successfully",
    published: "Form published successfully",
    unpublished: "Form unpublished successfully"
  },
  question: {
    added: "Question added successfully",
    updated: "Question updated successfully",
    deleted: "Question deleted successfully",
    reordered: "Questions reordered successfully"
  },
  section: {
    added: "Section added successfully",
    updated: "Section updated successfully",
    deleted: "Section deleted successfully"
  },
  response: {
    saved: "Response saved successfully",
    submitted: "Response submitted successfully",
    autoSaved: "Auto-saved"
  },
  auth: {
    loginSuccess: "Login successful",
    logoutSuccess: "Logged out successfully",
    registerSuccess: "Registration successful"
  },
  error: {
    generic: "Something went wrong. Please try again.",
    network: "Network error. Please check your connection.",
    unauthorized: "You are not authorized to perform this action.",
    notFound: "Resource not found.",
    validation: "Please check the form for errors."
  }
} as const;

// ============================================
// SCORING PRESETS
// ============================================

export const SCORING_PRESETS = [
  { label: "No Negative Marking", marks: 1, negative: 0 },
  { label: "Standard (1, -0.25)", marks: 1, negative: 0.25 },
  { label: "Moderate (2, -0.5)", marks: 2, negative: 0.5 },
  { label: "Strict (4, -1)", marks: 4, negative: 1 }
] as const;

// ============================================
// TIME PRESETS
// ============================================

export const TIME_LIMIT_PRESETS = [
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
  { label: "1.5 hours", value: 90 },
  { label: "2 hours", value: 120 },
  { label: "3 hours", value: 180 }
] as const;

export const COOLDOWN_PRESETS = [
  { label: "No cooldown", value: 0 },
  { label: "30 minutes", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "6 hours", value: 360 },
  { label: "1 day", value: 1440 },
  { label: "1 week", value: 10080 }
] as const;
