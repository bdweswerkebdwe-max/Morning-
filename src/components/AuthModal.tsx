import React, { useState } from 'react';
import {
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  X,
  Info,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang = 'ar' }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    resetPassword,
    sendVerificationEmail,
    loading,
    error,
    clearError,
    isConfigured,
  } = useAuth();

  const isRtl = lang === 'ar';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'verify_email'>('login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback Messages
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const passwordStrength = AuthService.checkPasswordStrength(password);
  const isEmailValid = AuthService.isValidEmail(email);

  const resetForm = () => {
    setLocalError(null);
    setSuccessMessage(null);
    clearError();
  };

  const switchMode = (newMode: 'login' | 'register' | 'forgot_password' | 'verify_email') => {
    resetForm();
    setMode(newMode);
  };

  // Google Sign-In Handler
  const handleGoogleLogin = async () => {
    resetForm();
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccessMessage(isRtl ? 'تم تسجيل الدخول بنجاح عبر Google' : 'Signed in successfully with Google');
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      setLocalError(formatted.messageAr);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();

    if (!isEmailValid) {
      setLocalError(isRtl ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!password) {
          setLocalError(isRtl ? 'يرجى إدخال كلمة المرور' : 'Please enter your password');
          setIsSubmitting(false);
          return;
        }
        await loginWithEmail({ email, password, rememberMe });
        setSuccessMessage(isRtl ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully');
        setTimeout(() => {
          onClose();
        }, 500);
      } else if (mode === 'register') {
        if (!fullName.trim()) {
          setLocalError(isRtl ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        if (!password || password.length < 8) {
          setLocalError(isRtl ? 'كلمة المرور يجب أن لا تقل عن 8 خانات' : 'Password must be at least 8 characters');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setLocalError(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail({ fullName, email, password });
        setSuccessMessage(isRtl ? 'تم إنشاء الحساب بنجاح وإرسال رابط التحقق' : 'Account created successfully!');
        setMode('verify_email');
      } else if (mode === 'forgot_password') {
        await resetPassword(email);
        setSuccessMessage(
          isRtl
            ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.'
            : 'Password reset link sent to your email.'
        );
      }
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      setLocalError(formatted.messageAr);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend Email Verification Handler
  const handleResendVerification = async () => {
    resetForm();
    setIsSubmitting(true);
    try {
      await sendVerificationEmail();
      setSuccessMessage(isRtl ? 'تم إعادة إرسال بريد التحقق بنجاح' : 'Verification email resent');
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      setLocalError(formatted.messageAr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden my-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          title={isRtl ? 'إغلاق' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">
            {mode === 'login' && (isRtl ? 'تسجيل الدخول إلى MOLAN AI' : 'Sign In to MOLAN AI')}
            {mode === 'register' && (isRtl ? 'إنشاء حساب جديد' : 'Create New Account')}
            {mode === 'forgot_password' && (isRtl ? 'استعادة كلمة المرور' : 'Reset Password')}
            {mode === 'verify_email' && (isRtl ? 'التحقق من البريد الإلكتروني' : 'Verify Your Email')}
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            {mode === 'login' && (isRtl ? 'أدخل بياناتك للوصول إلى استوديوهات توليد الفيديو والصور ورصيدك' : 'Access your commercial AI studios and credit balance')}
            {mode === 'register' && (isRtl ? 'احصل على 50 نقطة مجانية واستكشف توليد الإعلانات بالذكاء الاصطناعي' : 'Get 50 free credits and start generating AI video ads')}
            {mode === 'forgot_password' && (isRtl ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور' : 'Enter your registered email to receive a password reset link')}
            {mode === 'verify_email' && (isRtl ? 'يرجى مراجعة صندوق الوارد في بريدك الإلكتروني لتأكيد الحساب' : 'Please check your inbox to verify your account email')}
          </p>
        </div>

        {/* Environment Readiness Notice Banner */}
        {!isConfigured && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{isRtl ? 'جاهزية كود Firebase Authentication:' : 'Firebase Auth Code Architecture Ready:'}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {isRtl
                ? 'كود المصادقة مهيّأ وجاهز بالكامل. يمكنك تزويد متغيرات VITE_FIREBASE_* لاحقًا للربط المباشر بالمشروع.'
                : 'Auth service logic & forms are fully active in code. Set VITE_FIREBASE_* env vars to connect directly.'}
            </p>
          </div>
        )}

        {/* Error Alert */}
        {displayError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body for Login & Register */}
        {(mode === 'login' || mode === 'register' || mode === 'forgot_password') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Google Login Official Button (on Login & Register) */}
            {mode !== 'forgot_password' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || loading}
                  className="w-full py-3.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 rounded-2xl text-slate-200 text-xs font-bold transition flex items-center justify-center gap-3 shadow-md group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isRtl ? 'المتابعة باستخدام Google' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-3 my-2 text-slate-500 text-xs">
                  <div className="flex-1 h-px bg-slate-800" />
                  <span>{isRtl ? 'أو عبر البريد الإلكتروني' : 'or with email'}</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
              </>
            )}

            {/* Full Name (Register Mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isRtl ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isRtl ? 'أدخل اسمك الكامل' : 'Enter your name'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-4 py-3 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password Fields (Login & Register Modes) */}
            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    {isRtl ? 'كلمة المرور' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot_password')}
                      className="text-[11px] text-amber-400 hover:underline font-bold"
                    >
                      {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pr-10 pl-10 py-3 text-white text-xs focus:outline-none focus:border-amber-500 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter on Register */}
                {mode === 'register' && password && (
                  <div className="mt-2 space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isRtl ? 'قوة كلمة المرور:' : 'Password Strength:'}</span>
                      <span className="font-bold text-amber-400">{passwordStrength.labelAr}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 3
                            ? 'bg-emerald-500'
                            : passwordStrength.score === 2
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password (Register Mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full bg-slate-950 border rounded-2xl pr-10 pl-4 py-3 text-white text-xs focus:outline-none transition ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-500/80'
                        : 'border-slate-800 focus:border-amber-500'
                    }`}
                    required
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[10px] text-red-400 mt-1 font-bold">
                    {isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me Checkbox (Login Mode) */}
            {mode === 'login' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/40"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer">
                  {isRtl ? 'تذكر الجلسة بأمان' : 'Keep me signed in'}
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition text-xs disabled:opacity-50 mt-2"
            >
              {isSubmitting || loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && (isRtl ? 'تسجيل الدخول' : 'Sign In')}
                    {mode === 'register' && (isRtl ? 'إنشاء الحساب' : 'Create Account')}
                    {mode === 'forgot_password' && (isRtl ? 'إرسال رابط الإعادة' : 'Send Reset Link')}
                  </span>
                  <ArrowLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Email Verification Action Body */}
        {mode === 'verify_email' && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isRtl
                ? `لقد أرسلنا رابط تفعيل الحساب إلى البريد الإلكتروني: ${email}`
                : `We sent a verification link to ${email}`}
            </p>
            <button
              onClick={handleResendVerification}
              disabled={isSubmitting}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isRtl ? 'إعادة إرسال رابط التفعيل' : 'Resend Verification Link'}</span>
            </button>
          </div>
        )}

        {/* Footer Navigation Links */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          {mode === 'login' ? (
            <button
              onClick={() => switchMode('register')}
              className="text-amber-400 hover:underline font-bold"
            >
              {isRtl ? 'ليس لديك حساب؟ أنشئ حساباً مجانًا' : 'Don\'t have an account? Sign Up'}
            </button>
          ) : (
            <button
              onClick={() => switchMode('login')}
              className="text-amber-400 hover:underline font-bold"
            >
              {isRtl ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Sign In'}
            </button>
          )}

          <button onClick={onClose} className="hover:text-white transition">
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
