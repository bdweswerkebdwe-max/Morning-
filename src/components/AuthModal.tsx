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
  X,
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
  } = useAuth();

  const isRtl = lang === 'ar';

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'verify_email'>('login');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-white border border-neutral-200 rounded-xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-xl relative text-neutral-900 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition"
          title={isRtl ? 'إغلاق' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-lg bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-xs font-bold">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-neutral-900">
            {mode === 'login' && (isRtl ? 'تسجيل الدخول إلى MOLAN AI' : 'Sign In to MOLAN AI')}
            {mode === 'register' && (isRtl ? 'إنشاء حساب جديد' : 'Create New Account')}
            {mode === 'forgot_password' && (isRtl ? 'استعادة كلمة المرور' : 'Reset Password')}
            {mode === 'verify_email' && (isRtl ? 'التحقق من البريد الإلكتروني' : 'Verify Your Email')}
          </h2>
          <p className="text-neutral-500 text-xs leading-relaxed">
            {mode === 'login' && (isRtl ? 'أدخل بياناتك للوصول إلى الاستوديوهات ورصيدك' : 'Access your commercial AI studios and credit balance')}
            {mode === 'register' && (isRtl ? 'احصل على 50 نقطة مجانية واستكشف توليد الإعلانات' : 'Get 50 free credits and start generating AI video ads')}
            {mode === 'forgot_password' && (isRtl ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين' : 'Enter your registered email to receive a password reset link')}
            {mode === 'verify_email' && (isRtl ? 'يرجى مراجعة البريد الإلكتروني لتأكيد الحساب' : 'Please check your inbox to verify your account email')}
          </p>
        </div>

        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-neutral-100 border border-neutral-300 text-neutral-900 p-3 rounded-lg text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-neutral-900" />
            <span>{successMessage}</span>
          </div>
        )}

        {(mode === 'login' || mode === 'register' || mode === 'forgot_password') && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'forgot_password' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || loading}
                  className="w-full py-3 px-4 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isRtl ? 'المتابعة باستخدام Google' : 'Continue with Google'}</span>
                </button>

                <div className="flex items-center gap-2 text-neutral-400 text-[11px] my-2">
                  <div className="flex-1 h-px bg-neutral-200" />
                  <span>{isRtl ? 'أو عبر البريد' : 'or with email'}</span>
                  <div className="flex-1 h-px bg-neutral-200" />
                </div>
              </>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  {isRtl ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isRtl ? 'الاسم الكامل' : 'Enter your name'}
                    className="w-full bg-white border border-neutral-200 rounded-lg pr-9 pl-3 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-neutral-200 rounded-lg pr-9 pl-3 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-neutral-800">
                    {isRtl ? 'كلمة المرور' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot_password')}
                      className="text-[11px] text-neutral-900 hover:underline font-bold"
                    >
                      {isRtl ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-200 rounded-lg pr-9 pl-9 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === 'register' && password && (
                  <div className="mt-1.5 space-y-1 bg-neutral-50 p-2 rounded border border-neutral-200">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">{isRtl ? 'القوة:' : 'Strength:'}</span>
                      <span className="font-bold text-neutral-900">{passwordStrength.labelAr}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1">
                  {isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-neutral-200 rounded-lg pr-9 pl-3 py-2.5 text-neutral-900 text-xs focus:outline-none focus:border-neutral-900 transition"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <label htmlFor="rememberMe" className="text-xs text-neutral-600 cursor-pointer">
                  {isRtl ? 'تذكر الجلسة بأمان' : 'Keep me signed in'}
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-lg shadow-xs flex items-center justify-center gap-2 transition text-xs disabled:opacity-50 mt-2"
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

        {mode === 'verify_email' && (
          <div className="space-y-3 text-center">
            <div className="w-10 h-10 bg-neutral-100 text-neutral-900 rounded-lg flex items-center justify-center mx-auto font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              {isRtl
                ? `لقد أرسلنا رابط تفعيل الحساب إلى البريد: ${email}`
                : `We sent a verification link to ${email}`}
            </p>
            <button
              onClick={handleResendVerification}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold rounded-lg text-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isRtl ? 'إعادة إرسال رابط التفعيل' : 'Resend Verification Link'}</span>
            </button>
          </div>
        )}

        <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          {mode === 'login' ? (
            <button
              onClick={() => switchMode('register')}
              className="text-neutral-900 hover:underline font-bold"
            >
              {isRtl ? 'ليس لديك حساب؟ أنشئ حساباً مجانًا' : 'Don\'t have an account? Sign Up'}
            </button>
          ) : (
            <button
              onClick={() => switchMode('login')}
              className="text-neutral-900 hover:underline font-bold"
            >
              {isRtl ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Sign In'}
            </button>
          )}

          <button onClick={onClose} className="hover:text-neutral-900 transition">
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
