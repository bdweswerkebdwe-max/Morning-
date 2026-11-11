import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  updateProfile,
  User as FirebaseUser,
  AuthError as FirebaseAuthError,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { AuthUser, LoginCredentials, RegisterCredentials, PasswordStrength } from '../types/auth';

export class AuthService {
  /**
   * Helper to format Firebase error codes into friendly Arabic and English user error messages
   */
  static formatAuthError(error: any): { messageAr: string; messageEn: string; code: string } {
    const code = error?.code || 'auth/unknown';

    switch (code) {
      case 'auth/user-not-found':
        return {
          code,
          messageAr: 'البريد الإلكتروني غير مسجل لدينا. يمكنك إنشاء حساب جديد.',
          messageEn: 'No account found with this email address.',
        };
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return {
          code,
          messageAr: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
          messageEn: 'Invalid email or password credentials.',
        };
      case 'auth/email-already-in-use':
        return {
          code,
          messageAr: 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر.',
          messageEn: 'This email address is already registered.',
        };
      case 'auth/weak-password':
        return {
          code,
          messageAr: 'كلمة المرور ضعيفة جدًا. يرجى اختيار كلمة مرور أطول وأقوى (8 خانات على الأقل).',
          messageEn: 'Password is too weak. Please choose at least 8 characters.',
        };
      case 'auth/invalid-email':
        return {
          code,
          messageAr: 'صيغة البريد الإلكتروني غير صالحة.',
          messageEn: 'Invalid email address format.',
        };
      case 'auth/unauthorized-domain':
        return {
          code,
          messageAr: 'نطاق هذا الموقع غير مصرّح به في إعدادات Firebase Authentication. يرجى إضافة النطاق الحالي في لوحة تحكم Firebase: Firebase Console -> Authentication -> Settings -> Authorized Domains',
          messageEn: 'This domain is not authorized in Firebase Authentication settings. Please add it to Authorized Domains in Firebase Console.',
        };
      case 'auth/operation-not-allowed':
        return {
          code,
          messageAr: 'طريقة تسجيل الدخول هذه غير مفعّلة في Firebase Console. يرجى تفعيلها من: Firebase Console -> Authentication -> Sign-in method (Email/Password أو Google)',
          messageEn: 'This sign-in provider is not enabled in Firebase Console -> Authentication -> Sign-in method.',
        };
      case 'auth/popup-closed-by-user':
        return {
          code,
          messageAr: 'تم إغلاق نافذة تسجيل الدخول بـ Google قبل إتمام العملية.',
          messageEn: 'Google sign-in popup was closed before completing authentication.',
        };
      case 'auth/popup-blocked':
        return {
          code,
          messageAr: 'تم حظر نافذة تسجيل الدخول المنبثقة في المتصفح. يرجى السماح بالنوافذ المنبثقة لإكمال العملية.',
          messageEn: 'Sign-in popup was blocked by browser settings.',
        };
      case 'auth/too-many-requests':
        return {
          code,
          messageAr: 'تم تقديم محاولات كثيرة خاطئة. يرجى الانتظار بضع دقائق والمحاولة لاحقاً.',
          messageEn: 'Too many failed attempts. Please try again later.',
        };
      case 'auth/network-request-failed':
        return {
          code,
          messageAr: 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.',
          messageEn: 'Network error. Please check your internet connection.',
        };
      case 'auth/invalid-continue-uri':
        return {
          code,
          messageAr: 'رابط إعادة التوجيه في Firebase غير مصرح به أو غير صالح. يرجى إضافة رابط هذا الموقع إلى القائمة المسموحة (Authorized Domains) في Firebase Console.',
          messageEn: 'The continue URL provided in the request is invalid or not whitelisted in Firebase Console Authorized Domains.',
        };
      case 'auth/missing-continue-uri':
        return {
          code,
          messageAr: 'رابط العودة مطلوب لإكمال العملية.',
          messageEn: 'A valid continue URL must be provided in the request.',
        };
      case 'auth/invalid-action-code':
        return {
          code,
          messageAr: 'رمز تفعيل الحساب أو استعادة كلمة المرور غير صالح أو منتهي الصلاحية.',
          messageEn: 'The action code is invalid, expired, or already used.',
        };
      case 'auth/not-configured':
        return {
          code,
          messageAr: 'إعدادات Firebase Authentication غير مهيأة بعد بشكل صحيح أو أن المفاتيح مفقودة.',
          messageEn: 'Firebase configuration is incomplete or uninitialized.',
        };
      default:
        return {
          code,
          messageAr: error?.message || 'حدث خطأ غير متوقع أثناء المصادقة. يرجى المحاولة لاحقاً.',
          messageEn: error?.message || 'An authentication error occurred. Please try again.',
        };
    }
  }

  /**
   * Calculate password strength metrics
   */
  static checkPasswordStrength(password: string): PasswordStrength {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    let score = 0;
    if (hasMinLength) score++;
    if (hasUppercase && hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSpecialChar) score++;

    let label = 'Weak';
    let labelAr = 'ضعيفة';

    if (score === 4) {
      label = 'Strong';
      labelAr = 'قوية جدًا';
    } else if (score === 3) {
      label = 'Good';
      labelAr = 'جيدة';
    } else if (score === 2) {
      label = 'Medium';
      labelAr = 'متوسطة';
    }

    return {
      score,
      label,
      labelAr,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    };
  }

  /**
   * Validate email format regex
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Sign in with Google Popup
   */
  static async loginWithGoogle(): Promise<AuthUser> {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw { code: 'auth/not-configured' };
    }

    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Sync or create user profile in Firestore if db is ready
    let userRole: 'admin' | 'user' = 'user';
    let userCredits = 50;

    if (db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // New user document setup
          await setDoc(userRef, {
            uid: user.uid,
            fullName: user.displayName || 'مستخدم MOLAN AI',
            email: user.email,
            photoURL: user.photoURL,
            provider: 'google.com',
            emailVerified: user.emailVerified,
            role: 'user',
            credits: 50,
            accountStatus: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const data = userSnap.data();
          userRole = data.role || 'user';
          userCredits = data.credits ?? 50;
        }
      } catch (e) {
        console.error('Firestore user profile sync error:', e);
      }
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: 'google.com',
      role: userRole,
      credits: userCredits,
    };
  }

  /**
   * Register with Email and Password
   */
  static async registerWithEmail(credentials: RegisterCredentials): Promise<AuthUser> {
    if (!isFirebaseConfigured || !auth) {
      throw { code: 'auth/not-configured' };
    }

    const { fullName, email, password } = credentials;

    if (!password) {
      throw new Error('كلمة المرور مطلوبة');
    }

    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;

    // Update display name profile
    if (fullName) {
      await updateProfile(user, { displayName: fullName.trim() });
    }

    // Send email verification with published domain return URL
    try {
      const actionCodeSettings = {
        url: typeof window !== 'undefined' && window.location.origin.includes('morning-whehsn.vercel.app')
          ? window.location.origin
          : 'https://morning-whehsn.vercel.app',
        handleCodeInApp: true,
      };
      await sendEmailVerification(user, actionCodeSettings);
    } catch (e: any) {
      console.warn('⚠️ Initial verification email send warning (Firebase Auth user account created successfully):', e?.code || e?.message || e);
    }

    // Create user document in Firestore users collection
    if (db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          uid: user.uid,
          fullName: fullName.trim(),
          email: user.email,
          photoURL: user.photoURL,
          provider: 'password',
          emailVerified: user.emailVerified,
          role: 'user',
          credits: 50,
          accountStatus: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error('Firestore user profile document creation error:', e);
      }
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: fullName.trim(),
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: 'password',
      role: 'user',
      credits: 50,
    };
  }

  /**
   * Sign in with Email and Password
   */
  static async loginWithEmail(credentials: LoginCredentials): Promise<AuthUser> {
    if (!isFirebaseConfigured || !auth) {
      throw { code: 'auth/not-configured' };
    }

    const { email, password } = credentials;

    if (!password) {
      throw new Error('يرجى إدخال كلمة المرور');
    }

    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = result.user;

    let userRole: 'admin' | 'user' = 'user';
    let userCredits = 50;

    if (db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          userRole = data.role || 'user';
          userCredits = data.credits ?? 50;
        }
      } catch (e) {
        console.error('Error fetching user profile from Firestore:', e);
      }
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'مستخدم معلن',
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: 'password',
      role: userRole,
      credits: userCredits,
    };
  }

  /**
   * Send Password Reset Email
   */
  static async sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      throw { code: 'auth/not-configured' };
    }

    const actionCodeSettings = {
      url: typeof window !== 'undefined' && window.location.origin.includes('morning-whehsn.vercel.app')
        ? window.location.origin
        : 'https://morning-whehsn.vercel.app',
      handleCodeInApp: true,
    };

    try {
      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
    } catch (err: any) {
      console.error('❌ sendPasswordReset failed:', err?.code || err?.message || err);
      throw err;
    }
  }

  /**
   * Send Email Verification to Current Signed-In User
   */
  static async sendEmailVerificationEmail(): Promise<void> {
    if (!isFirebaseConfigured || !auth || !auth.currentUser) {
      throw { code: 'auth/not-configured' };
    }

    const actionCodeSettings = {
      url: typeof window !== 'undefined' && window.location.origin.includes('morning-whehsn.vercel.app')
        ? window.location.origin
        : 'https://morning-whehsn.vercel.app',
      handleCodeInApp: true,
    };

    try {
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
    } catch (err: any) {
      console.error('❌ sendEmailVerificationEmail failed:', err?.code || err?.message || err);
      throw err;
    }
  }

  /**
   * Sign out current session
   */
  static async logout(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
  }

  /**
   * Convert FirebaseUser to AuthUser domain model
   */
  static mapFirebaseUser(user: FirebaseUser, extraData?: { role?: 'admin' | 'user'; credits?: number }): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'مستخدم MOLAN AI',
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: user.providerData[0]?.providerId || 'password',
      role: extraData?.role || 'user',
      credits: extraData?.credits ?? 50,
    };
  }
}
