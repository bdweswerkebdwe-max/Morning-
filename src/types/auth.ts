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
