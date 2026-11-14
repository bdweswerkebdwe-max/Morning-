export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string;
  role: 'admin' | 'user';
  credits: number;
  tier?: 'free' | 'pro' | 'enterprise';
  createdAt?: string;
  accountStatus?: 'active' | 'suspended';
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthError {
  code: string;
  message: string;
  messageAr: string;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  label: string;
  labelAr: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export type AuthStage =
  | 'idle'
  | 'firebase_init'
  | 'auth_google'
  | 'auth_email'
  | 'auth_register'
  | 'auth_reset'
  | 'auth_verify'
  | 'id_token'
  | 'auth_state_listener'
  | 'firestore_profile';

export interface AuthDiagnostic {
  stage: AuthStage;
  stageLabelAr: string;
  authSuccess: boolean;
  onAuthStateChangedFired: boolean;
  idTokenSuccess: boolean | null;
  firestoreSuccess: boolean | null;
  errorCode: string | null;
  errorMessage: string | null;
  firestoreErrorCode: string | null;
  firestoreErrorMessage: string | null;
  projectId: string;
  authDomain: string;
  currentOrigin: string;
  timestamp: string;
}
