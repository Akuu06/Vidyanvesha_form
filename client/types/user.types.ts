// User & Authentication Types

// ============================================
// USER INTERFACES
// ============================================

export interface User {
  id: string; // UUID
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  institute_id: number;
  university_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT = "student",
  GUEST = "guest"
}

// ============================================
// AUTHENTICATION
// ============================================

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  allowed_urls: string[];
  permissions: Permission[];
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: UserRole;
  institute_id?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface FirebaseAuthPayload {
  firebase_token: string;
}

// ============================================
// PERMISSIONS & RBAC
// ============================================

export interface Permission {
  id: number;
  name: string;
  code: string;
  module: Module;
}

export interface Module {
  id: number;
  name: string;
  code: string;
  parent_module?: number;
  level: ModuleLevel;
  allowed_urls: string[];
}

export enum ModuleLevel {
  SUPER_PARENT = "super_parent",
  PARENT = "parent",
  CHILD = "child",
  URL = "url"
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  modules: Module[];
}

// ============================================
// USER GROUPS
// ============================================

export interface UserGroup {
  id: string; // UUID
  name: string;
  description: string;
  members: string[]; // User IDs
  institute_id: number;
  university_id: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// PROFILE & PREFERENCES
// ============================================

export interface UserProfile extends User {
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  timezone: string;
}

// ============================================
// SESSION & CONTEXT
// ============================================

export interface SessionContext {
  user: User;
  tokens: AuthTokens;
  permissions: Permission[];
  allowed_urls: string[];
  institute_id: number;
  university_id: number;
  last_activity: string;
}

export interface AuthContextValue {
  session: SessionContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithFirebase: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  hasPermission: (code: string) => boolean;
  hasAccess: (url: string) => boolean;
}
