// Form Management System - TypeScript Types

// ============================================
// ENUMS
// ============================================

export enum FormMode {
  NORMAL_FORM = "normal_form",
  QUIZ = "quiz"
}

export enum FormStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed"
}

export enum TimerStartMode {
  OPEN = "open",
  FIRST_QUESTION = "first_question"
}

export enum QuestionType {
  MCQ_SINGLE = "mcq_single",
  MCQ_MULTIPLE = "mcq_multiple",
  TEXT_SHORT = "text_short",
  TEXT_LONG = "text_long",
  FILE_UPLOAD = "file_upload",
  RATING = "rating",
  DATE = "date",
  TIME = "time"
}

export enum LogicAction {
  SHOW = "show",
  HIDE = "hide",
  JUMP_SECTION = "jump_section",
  JUMP_QUESTION = "jump_question"
}

export enum EventType {
  TAB_SWITCH = "TAB_SWITCH",
  FULLSCREEN_EXIT = "FULLSCREEN_EXIT",
  COPY_ATTEMPT = "COPY_ATTEMPT",
  PASTE_ATTEMPT = "PASTE_ATTEMPT",
  CONTEXT_MENU = "CONTEXT_MENU"
}

// ============================================
// BASE INTERFACES
// ============================================

export interface TimeStampedAudit {
  created_dt: string; // ISO DateTime
  updated_dt: string; // ISO DateTime
  created_by: number;
  updated_by: number;
  created_by_username?: string;
  updated_by_username?: string;
}

// ============================================
// FORM INTERFACES
// ============================================

export interface Form extends TimeStampedAudit {
  id: number;
  public_id: string; // UUID
  
  // Basic Info
  title: string;
  description: string;
  mode: FormMode;
  status: FormStatus;
  
  // Access Control
  is_public: boolean;
  login_required: boolean;
  allow_anonymous: boolean;
  
  // Time Management
  start_date: string | null; // ISO DateTime
  end_date: string | null; // ISO DateTime
  grace_minutes: number;
  
  // Attempts
  max_attempts: number;
  cooldown_minutes: number;
  
  // Timer Configuration
  time_limit_minutes: number | null;
  timer_starts_on: TimerStartMode;
  auto_submit_on_close: boolean;
  
  // Navigation
  allow_back_navigation: boolean;
  one_question_per_page: boolean;
  show_progress_bar: boolean;
  enable_review_page: boolean;
  
  // Shuffling
  shuffle_questions: boolean;
  shuffle_options_globally: boolean;
  
  // Scoring
  passing_marks: number | null;
  enable_negative_marking: boolean;
  round_score_to: number;
  
  // Result Display
  show_result_immediately: boolean;
  show_correct_answers: boolean;
  show_explanations: boolean;
  show_score_breakup: boolean;
  
  // Auto-save
  auto_save_answers: boolean;
  save_interval_seconds: number;
  
  // Security
  record_ip_address: boolean;
  detect_tab_switch: boolean;
  require_fullscreen: boolean;
  webcam_required: boolean;
  disable_copy_paste: boolean;
  
  // References
  institute_id: number;
  university_id: number;
  
  // Computed Fields (from serializers)
  question_count?: number;
  response_count?: number;
  sections?: FormSection[];
  questions?: FormQuestion[];
}

export interface FormSection extends TimeStampedAudit {
  id: number;
  form: number; // Form ID
  title: string;
  description: string;
  order: number;
  institute_id: number;
  university_id: number;
  
  // Computed/Relations
  questions?: FormQuestion[];
  question_count?: number;
}

export interface FormQuestion extends TimeStampedAudit {
  id: number;
  form: number; // Form ID
  section: number | null; // FormSection ID
  question_id: number; // External question microservice ID
  consider_for_analytics: boolean;
  order: number;
  is_required: boolean;
  marks: number;
  negative_marks: number;
  shuffle_options_override: boolean | null;
  time_limit_seconds: number | null;
  institute_id: number;
  university_id: number;
  
  // Computed/Relations
  snapshot?: QuestionSnapshot;
  section_title?: string;
}

export interface QuestionPool extends TimeStampedAudit {
  id: number;
  form: number; // Form ID
  name: string;
  pick_count: number;
  shuffle_questions: boolean;
  institute_id: number;
  university_id: number;
}

export interface QuestionLogic extends TimeStampedAudit {
  id: number;
  form: number; // Form ID
  source_question_id: number;
  expected_answer: string;
  target_question_id: number;
  action: LogicAction;
  institute_id: number;
  university_id: number;
}

// ============================================
// QUESTION SNAPSHOT
// ============================================

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
  order?: number;
}

export interface QuestionSnapshot extends TimeStampedAudit {
  id: number;
  form_question: number; // FormQuestion ID (OneToOne)
  question_text: string;
  question_type: QuestionType;
  options_snapshot: QuestionOption[] | null;
  explanation?: string;
  hint?: string;
  institute_id: number;
  university_id: number;
}

// ============================================
// RESPONSE INTERFACES
// ============================================

export interface FormResponse extends TimeStampedAudit {
  id: number;
  form: number; // Form ID
  user_id: string | null; // UUID
  attempt_number: number;
  started_at: string; // ISO DateTime
  submitted_at: string | null; // ISO DateTime
  total_time_seconds: number;
  score: number;
  passed: boolean;
  is_completed: boolean;
  ip_address: string | null;
  institute_id: number;
  university_id: number;
  
  // Computed/Relations
  answers?: FormAnswer[];
  answer_count?: number;
  file_uploads?: ResponseFileUpload[];
  attempt_logs?: FormAttemptLog[];
  user_name?: string;
  user_email?: string;
  form_title?: string;
}

export interface FormAnswer extends TimeStampedAudit {
  id: number;
  response: number; // FormResponse ID
  question_id: number;
  answer_text: string | null;
  selected_option_ids: string[] | null; // ["opt_1", "opt_3"]
  displayed_option_order: string[] | null;
  time_spent_seconds: number;
  is_correct: boolean | null;
  marks_awarded: number;
  institute_id: number;
  university_id: number;
  
  // Computed
  question_text?: string;
  question_type?: QuestionType;
}

export interface ResponseFileUpload extends TimeStampedAudit {
  id: number;
  response: number; // FormResponse ID
  question_id: number;
  file_path: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  institute_id: number;
  university_id: number;
}

// ============================================
// ACCESS & SECURITY
// ============================================

export interface FormAccessRule extends TimeStampedAudit {
  id: number;
  form: number; // Form ID
  allowed_email_domain: string;
  allowed_user_group_id: string | null; // UUID
  otp_required: boolean;
  institute_id: number;
  university_id: number;
}

export interface FormAttemptLog extends TimeStampedAudit {
  id: number;
  response: number; // FormResponse ID
  event_type: EventType;
  timestamp: string; // ISO DateTime
  ip_address: string | null;
  details?: string;
  institute_id: number;
  university_id: number;
}

// ============================================
// ANALYTICS
// ============================================

export interface QuestionAnalytics extends TimeStampedAudit {
  id: number;
  form: number; // Form ID
  question_id: number;
  total_attempts: number;
  correct_attempts: number;
  accuracy_percentage: number; // Computed property
  institute_id: number;
  university_id: number;
  
  // Computed
  question_text?: string;
  average_time_spent?: number;
}

// ============================================
// FRONTEND-SPECIFIC TYPES
// ============================================

export interface FormBuilderState {
  form: Partial<Form>;
  sections: FormSection[];
  questions: FormQuestion[];
  snapshots: Record<number, QuestionSnapshot>;
  isDirty: boolean;
  isSaving: boolean;
}

export interface FormSubmissionState {
  form: Form;
  response: Partial<FormResponse>;
  answers: Record<number, Partial<FormAnswer>>;
  currentQuestionIndex: number;
  timeRemaining: number | null;
  isSubmitting: boolean;
  attemptLogs: FormAttemptLog[];
}

export interface QuestionWithSnapshot extends FormQuestion {
  snapshot: QuestionSnapshot;
}

export interface SectionWithQuestions extends FormSection {
  questions: QuestionWithSnapshot[];
}

export interface FormWithDetails extends Form {
  sections: SectionWithQuestions[];
  questions: QuestionWithSnapshot[];
  access_rules?: FormAccessRule[];
  question_pools?: QuestionPool[];
  question_logic?: QuestionLogic[];
}

// ============================================
// FORM CREATION/UPDATE PAYLOADS
// ============================================

export interface CreateFormPayload {
  title: string;
  description: string;
  mode: FormMode;
  status?: FormStatus;
  is_public?: boolean;
  login_required?: boolean;
  allow_anonymous?: boolean;
}

export interface UpdateFormPayload extends Partial<Form> {
  id: number;
}

export interface CreateSectionPayload {
  form: number;
  title: string;
  description?: string;
  order: number;
}

export interface CreateQuestionPayload {
  form: number;
  section?: number | null;
  question_id: number;
  question_text: string;
  question_type: QuestionType;
  options?: QuestionOption[];
  order: number;
  is_required?: boolean;
  marks?: number;
  negative_marks?: number;
  explanation?: string;
  hint?: string;
}

export interface SubmitAnswerPayload {
  response: number;
  question_id: number;
  answer_text?: string | null;
  selected_option_ids?: string[] | null;
  time_spent_seconds: number;
}
