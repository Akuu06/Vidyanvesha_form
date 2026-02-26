// API Response Types

// ============================================
// GENERIC API RESPONSE TYPES
// ============================================

export interface ApiError {
  detail: string;
  code?: string;
  field_errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

// ============================================
// QUERY PARAMETERS
// ============================================

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface SearchParams {
  search?: string;
}

export interface OrderingParams {
  ordering?: string; // e.g., "-created_dt" for descending
}

export interface FilterParams {
  [key: string]: string | number | boolean | undefined;
}

export interface QueryParams extends PaginationParams, SearchParams, OrderingParams, FilterParams {}

// ============================================
// FORM API SPECIFIC
// ============================================

export interface FormListParams extends QueryParams {
  status?: string;
  mode?: string;
  is_public?: boolean;
  created_dt__gte?: string;
  created_dt__lte?: string;
}

export interface FormQuestionListParams extends QueryParams {
  form?: number;
  section?: number;
  consider_for_analytics?: boolean;
  is_required?: boolean;
}

export interface FormResponseListParams extends QueryParams {
  form?: number;
  user_id?: string;
  is_completed?: boolean;
  passed?: boolean;
  submitted_at__gte?: string;
  submitted_at__lte?: string;
}

// ============================================
// SUCCESS MESSAGES
// ============================================

export interface SuccessMessage {
  message: string;
  data?: any;
}

// ============================================
// FILE UPLOAD
// ============================================

export interface FileUploadResponse {
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

// ============================================
// BATCH OPERATIONS
// ============================================

export interface BatchOperationResult {
  success_count: number;
  failure_count: number;
  errors?: ApiError[];
}
