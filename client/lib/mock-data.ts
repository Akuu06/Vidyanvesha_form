// Mock Data for Development

import {
  Form,
  FormSection,
  FormQuestion,
  QuestionSnapshot,
  FormResponse,
  FormAnswer,
  User,
  FormMode,
  FormStatus,
  QuestionType,
  TimerStartMode,
  UserRole
} from "@/types";

// ============================================
// MOCK USERS
// ============================================

export const mockUsers: User[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "admin@college.edu",
    username: "admin",
    first_name: "Admin",
    last_name: "User",
    full_name: "Admin User",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    role: UserRole.ADMIN,
    institute_id: 1,
    university_id: 1,
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "john.student@college.edu",
    username: "johnstudent",
    first_name: "John",
    last_name: "Student",
    full_name: "John Student",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    role: UserRole.STUDENT,
    institute_id: 1,
    university_id: 1,
    is_active: true,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "jane.smith@college.edu",
    username: "janesmith",
    first_name: "Jane",
    last_name: "Smith",
    full_name: "Jane Smith",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    role: UserRole.STUDENT,
    institute_id: 1,
    university_id: 1,
    is_active: true,
    created_at: "2024-01-22T10:00:00Z",
    updated_at: "2024-01-22T10:00:00Z"
  }
];

export const currentUser = mockUsers[0];

// ============================================
// MOCK QUESTION SNAPSHOTS
// ============================================

export const mockQuestionSnapshots: QuestionSnapshot[] = [
  {
    id: 1,
    form_question: 1,
    question_text: "What is the capital of France?",
    question_type: QuestionType.MCQ_SINGLE,
    options_snapshot: [
      { id: "opt_1", text: "London", is_correct: false, order: 1 },
      { id: "opt_2", text: "Paris", is_correct: true, order: 2 },
      { id: "opt_3", text: "Berlin", is_correct: false, order: 3 },
      { id: "opt_4", text: "Madrid", is_correct: false, order: 4 }
    ],
    explanation: "Paris is the capital and largest city of France.",
    hint: "Think of the Eiffel Tower",
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1
  },
  {
    id: 2,
    form_question: 2,
    question_text: "Select all prime numbers from the following:",
    question_type: QuestionType.MCQ_MULTIPLE,
    options_snapshot: [
      { id: "opt_1", text: "2", is_correct: true, order: 1 },
      { id: "opt_2", text: "3", is_correct: true, order: 2 },
      { id: "opt_3", text: "4", is_correct: false, order: 3 },
      { id: "opt_4", text: "5", is_correct: true, order: 4 },
      { id: "opt_5", text: "6", is_correct: false, order: 5 }
    ],
    explanation: "Prime numbers are divisible only by 1 and themselves.",
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1
  },
  {
    id: 3,
    form_question: 3,
    question_text: "Explain the concept of Object-Oriented Programming in your own words.",
    question_type: QuestionType.TEXT_LONG,
    options_snapshot: null,
    explanation: "Good answers should cover encapsulation, inheritance, polymorphism, and abstraction.",
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1
  },
  {
    id: 4,
    form_question: 4,
    question_text: "What is the derivative of x²?",
    question_type: QuestionType.TEXT_SHORT,
    options_snapshot: null,
    explanation: "The derivative of x² is 2x.",
    hint: "Use the power rule",
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1
  },
  {
    id: 5,
    form_question: 5,
    question_text: "What is the chemical formula for water?",
    question_type: QuestionType.MCQ_SINGLE,
    options_snapshot: [
      { id: "opt_1", text: "H2O", is_correct: true, order: 1 },
      { id: "opt_2", text: "CO2", is_correct: false, order: 2 },
      { id: "opt_3", text: "O2", is_correct: false, order: 3 },
      { id: "opt_4", text: "H2O2", is_correct: false, order: 4 }
    ],
    explanation: "Water is composed of two hydrogen atoms and one oxygen atom.",
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1
  },
  {
    id: 6,
    form_question: 6,
    question_text: "How satisfied are you with this course?",
    question_type: QuestionType.RATING,
    options_snapshot: null,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1
  }
];

// ============================================
// MOCK FORM SECTIONS
// ============================================

export const mockFormSections: FormSection[] = [
  {
    id: 1,
    form: 1,
    title: "General Knowledge",
    description: "Basic questions about geography and science",
    order: 1,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu"
  },
  {
    id: 2,
    form: 1,
    title: "Mathematics",
    description: "Basic math problems",
    order: 2,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu"
  },
  {
    id: 3,
    form: 2,
    title: "Programming Fundamentals",
    description: "Questions about basic programming concepts",
    order: 1,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-21T10:00:00Z",
    updated_dt: "2024-02-21T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu"
  }
];

// ============================================
// MOCK FORM QUESTIONS
// ============================================

export const mockFormQuestions: FormQuestion[] = [
  {
    id: 1,
    form: 1,
    section: 1,
    question_id: 101,
    consider_for_analytics: true,
    order: 1,
    is_required: true,
    marks: 1,
    negative_marks: 0.25,
    shuffle_options_override: null,
    time_limit_seconds: null,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    snapshot: mockQuestionSnapshots[0]
  },
  {
    id: 2,
    form: 1,
    section: 2,
    question_id: 102,
    consider_for_analytics: true,
    order: 2,
    is_required: true,
    marks: 2,
    negative_marks: 0.5,
    shuffle_options_override: false,
    time_limit_seconds: 120,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    snapshot: mockQuestionSnapshots[1]
  },
  {
    id: 3,
    form: 2,
    section: 3,
    question_id: 103,
    consider_for_analytics: false,
    order: 1,
    is_required: true,
    marks: 5,
    negative_marks: 0,
    shuffle_options_override: null,
    time_limit_seconds: 300,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-21T10:00:00Z",
    updated_dt: "2024-02-21T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    snapshot: mockQuestionSnapshots[2]
  },
  {
    id: 4,
    form: 1,
    section: 2,
    question_id: 104,
    consider_for_analytics: true,
    order: 3,
    is_required: true,
    marks: 1,
    negative_marks: 0,
    shuffle_options_override: null,
    time_limit_seconds: 60,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    snapshot: mockQuestionSnapshots[3]
  },
  {
    id: 5,
    form: 1,
    section: 1,
    question_id: 105,
    consider_for_analytics: true,
    order: 2,
    is_required: true,
    marks: 1,
    negative_marks: 0.25,
    shuffle_options_override: null,
    time_limit_seconds: null,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    snapshot: mockQuestionSnapshots[4]
  },
  {
    id: 6,
    form: 3,
    section: null,
    question_id: 106,
    consider_for_analytics: false,
    order: 1,
    is_required: true,
    marks: 0,
    negative_marks: 0,
    shuffle_options_override: null,
    time_limit_seconds: null,
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-22T10:00:00Z",
    updated_dt: "2024-02-22T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    snapshot: mockQuestionSnapshots[5]
  }
];

// ============================================
// MOCK FORMS
// ============================================

export const mockForms: Form[] = [
  {
    id: 1,
    public_id: "8b52f0c4-9b2e-41d4-a716-446655440001",
    title: "Semester 3 Internal Test",
    description: "Mid-semester examination covering general knowledge and mathematics",
    mode: FormMode.QUIZ,
    status: FormStatus.PUBLISHED,
    
    is_public: false,
    login_required: true,
    allow_anonymous: false,
    
    start_date: "2024-02-26T09:00:00Z",
    end_date: "2024-02-26T11:00:00Z",
    grace_minutes: 10,
    
    max_attempts: 2,
    cooldown_minutes: 1440,
    
    time_limit_minutes: 60,
    timer_starts_on: TimerStartMode.OPEN,
    auto_submit_on_close: true,
    
    allow_back_navigation: true,
    one_question_per_page: true,
    show_progress_bar: true,
    enable_review_page: true,
    
    shuffle_questions: true,
    shuffle_options_globally: true,
    
    passing_marks: 40,
    enable_negative_marking: true,
    round_score_to: 2,
    
    show_result_immediately: true,
    show_correct_answers: true,
    show_explanations: true,
    show_score_breakup: true,
    
    auto_save_answers: true,
    save_interval_seconds: 5,
    
    record_ip_address: true,
    detect_tab_switch: true,
    require_fullscreen: true,
    webcam_required: false,
    disable_copy_paste: true,
    
    institute_id: 1,
    university_id: 1,
    
    created_dt: "2024-02-20T10:00:00Z",
    updated_dt: "2024-02-20T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    
    question_count: 4,
    response_count: 15
  },
  {
    id: 2,
    public_id: "8b52f0c4-9b2e-41d4-a716-446655440002",
    title: "Programming Assessment",
    description: "Test your understanding of object-oriented programming concepts",
    mode: FormMode.QUIZ,
    status: FormStatus.PUBLISHED,
    
    is_public: false,
    login_required: true,
    allow_anonymous: false,
    
    start_date: "2024-02-27T14:00:00Z",
    end_date: "2024-02-27T16:00:00Z",
    grace_minutes: 5,
    
    max_attempts: 1,
    cooldown_minutes: 0,
    
    time_limit_minutes: 90,
    timer_starts_on: TimerStartMode.FIRST_QUESTION,
    auto_submit_on_close: true,
    
    allow_back_navigation: false,
    one_question_per_page: true,
    show_progress_bar: true,
    enable_review_page: false,
    
    shuffle_questions: false,
    shuffle_options_globally: false,
    
    passing_marks: 50,
    enable_negative_marking: false,
    round_score_to: 2,
    
    show_result_immediately: false,
    show_correct_answers: false,
    show_explanations: false,
    show_score_breakup: false,
    
    auto_save_answers: true,
    save_interval_seconds: 10,
    
    record_ip_address: true,
    detect_tab_switch: true,
    require_fullscreen: true,
    webcam_required: true,
    disable_copy_paste: true,
    
    institute_id: 1,
    university_id: 1,
    
    created_dt: "2024-02-21T10:00:00Z",
    updated_dt: "2024-02-21T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    
    question_count: 1,
    response_count: 8
  },
  {
    id: 3,
    public_id: "8b52f0c4-9b2e-41d4-a716-446655440003",
    title: "Course Feedback Form",
    description: "Help us improve! Share your feedback about this course",
    mode: FormMode.NORMAL_FORM,
    status: FormStatus.PUBLISHED,
    
    is_public: true,
    login_required: false,
    allow_anonymous: true,
    
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
    show_progress_bar: false,
    enable_review_page: true,
    
    shuffle_questions: false,
    shuffle_options_globally: false,
    
    passing_marks: null,
    enable_negative_marking: false,
    round_score_to: 2,
    
    show_result_immediately: false,
    show_correct_answers: false,
    show_explanations: false,
    show_score_breakup: false,
    
    auto_save_answers: true,
    save_interval_seconds: 5,
    
    record_ip_address: false,
    detect_tab_switch: false,
    require_fullscreen: false,
    webcam_required: false,
    disable_copy_paste: false,
    
    institute_id: 1,
    university_id: 1,
    
    created_dt: "2024-02-22T10:00:00Z",
    updated_dt: "2024-02-22T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    
    question_count: 1,
    response_count: 42
  },
  {
    id: 4,
    public_id: "8b52f0c4-9b2e-41d4-a716-446655440004",
    title: "Final Examination - Data Structures",
    description: "Comprehensive test on data structures and algorithms",
    mode: FormMode.QUIZ,
    status: FormStatus.DRAFT,
    
    is_public: false,
    login_required: true,
    allow_anonymous: false,
    
    start_date: "2024-03-15T10:00:00Z",
    end_date: "2024-03-15T13:00:00Z",
    grace_minutes: 15,
    
    max_attempts: 1,
    cooldown_minutes: 0,
    
    time_limit_minutes: 180,
    timer_starts_on: TimerStartMode.OPEN,
    auto_submit_on_close: true,
    
    allow_back_navigation: true,
    one_question_per_page: true,
    show_progress_bar: true,
    enable_review_page: true,
    
    shuffle_questions: true,
    shuffle_options_globally: true,
    
    passing_marks: 45,
    enable_negative_marking: true,
    round_score_to: 2,
    
    show_result_immediately: false,
    show_correct_answers: false,
    show_explanations: false,
    show_score_breakup: false,
    
    auto_save_answers: true,
    save_interval_seconds: 5,
    
    record_ip_address: true,
    detect_tab_switch: true,
    require_fullscreen: true,
    webcam_required: true,
    disable_copy_paste: true,
    
    institute_id: 1,
    university_id: 1,
    
    created_dt: "2024-02-25T10:00:00Z",
    updated_dt: "2024-02-25T10:00:00Z",
    created_by: 1,
    updated_by: 1,
    created_by_username: "admin@college.edu",
    updated_by_username: "admin@college.edu",
    
    question_count: 0,
    response_count: 0
  }
];

// ============================================
// MOCK FORM RESPONSES
// ============================================

export const mockFormResponses: FormResponse[] = [
  {
    id: 1,
    form: 1,
    user_id: "550e8400-e29b-41d4-a716-446655440002",
    attempt_number: 1,
    started_at: "2024-02-26T09:15:00Z",
    submitted_at: "2024-02-26T10:10:00Z",
    total_time_seconds: 3300,
    score: 87.5,
    passed: true,
    is_completed: true,
    ip_address: "192.168.1.100",
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-26T09:15:00Z",
    updated_dt: "2024-02-26T10:10:00Z",
    created_by: 2,
    updated_by: 2,
    created_by_username: "john.student@college.edu",
    updated_by_username: "john.student@college.edu",
    answer_count: 4,
    user_name: "John Student",
    user_email: "john.student@college.edu",
    form_title: "Semester 3 Internal Test"
  },
  {
    id: 2,
    form: 1,
    user_id: "550e8400-e29b-41d4-a716-446655440003",
    attempt_number: 1,
    started_at: "2024-02-26T09:20:00Z",
    submitted_at: "2024-02-26T10:15:00Z",
    total_time_seconds: 3300,
    score: 65.0,
    passed: true,
    is_completed: true,
    ip_address: "192.168.1.101",
    institute_id: 1,
    university_id: 1,
    created_dt: "2024-02-26T09:20:00Z",
    updated_dt: "2024-02-26T10:15:00Z",
    created_by: 3,
    updated_by: 3,
    created_by_username: "jane.smith@college.edu",
    updated_by_username: "jane.smith@college.edu",
    answer_count: 4,
    user_name: "Jane Smith",
    user_email: "jane.smith@college.edu",
    form_title: "Semester 3 Internal Test"
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getFormById(id: number): Form | undefined {
  return mockForms.find(form => form.id === id);
}

export function getFormByPublicId(publicId: string): Form | undefined {
  return mockForms.find(form => form.public_id === publicId);
}

export function getSectionsByFormId(formId: number): FormSection[] {
  return mockFormSections.filter(section => section.form === formId);
}

export function getQuestionsByFormId(formId: number): FormQuestion[] {
  return mockFormQuestions.filter(question => question.form === formId);
}

export function getQuestionsBySectionId(sectionId: number): FormQuestion[] {
  return mockFormQuestions.filter(question => question.section === sectionId);
}

export function getResponsesByFormId(formId: number): FormResponse[] {
  return mockFormResponses.filter(response => response.form === formId);
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find(user => user.id === id);
}
