import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
   * Always preserves and exposes the raw Firebase error code.
   */
  static formatAuthError(error: any): { messageAr: string; messageEn: string; code: string; rawMessage: string } {
    const code = error?.code || 'auth/unknown';
    const rawMessage = error?.message || String(error || 'Unknown error');

    switch (code) {
      case 'auth/user-not-found':
        return {
          code,
          rawMessage,
          messageAr: 'البريد الإلكتروني غير مسجل لدينا. يمكنك إنشاء حساب جديد.',
          messageEn: 'No account found with this email address.',
        };
      case 'auth/wrong-password':
        return {
          code,
          rawMessage,
          messageAr: 'كلمة المرور غير صحيحة.',
          messageEn: 'Incorrect password.',
        };
      case 'auth/invalid-credential':
        return {
          code,
          rawMessage,
          messageAr: 'بيانات الدخول غير صحيحة أو الحساب غير موجود بهذا البريد وكلمة المرور.',
          messageEn: 'Invalid email or password credentials.',
        };
      case 'auth/user-disabled':
        return {
          code,
          rawMessage,
          messageAr: 'تم تعطيل هذا الحساب من قِبل الإدارة في Firebase.',
          messageEn: 'This user account has been disabled.',
        };
      case 'auth/email-already-in-use':
        return {
          code,
          rawMessage,
          messageAr: 'هذا البريد الإلكتروني مسجل بالفعل لمستخدم آخر.',
          messageEn: 'This email address is already registered.',
        };
      case 'auth/weak-password':
        return {
          code,
          rawMessage,
          messageAr: 'كلمة المرور ضعيفة جدًا. يرجى اختيار كلمة مرور أطول وأقوى (8 خانات على الأقل).',
          messageEn: 'Password is too weak. Please choose at least 8 characters.',
        };
      case 'auth/invalid-email':
        return {
          code,
          rawMessage,
          messageAr: 'صيغة البريد الإلكتروني غير صالحة.',
          messageEn: 'Invalid email address format.',
        };
      case 'auth/unauthorized-domain':
        return {
          code,
          rawMessage,
          messageAr: 'نطاق هذا الموقع غير مصرّح به في إعدادات Firebase Authentication (Authorized Domains).',
          messageEn: 'This domain is not authorized in Firebase Authentication settings.',
        };
      case 'auth/operation-not-allowed':
        return {
          code,
          rawMessage,
          messageAr: 'طريقة تسجيل الدخول هذه غير مفعّلة في Firebase Console -> Authentication -> Sign-in method.',
          messageEn: 'This sign-in provider is not enabled in Firebase Console -> Authentication -> Sign-in method.',
        };
      case 'auth/popup-closed-by-user':
      case 'auth/cancelled-popup-request':
        return {
          code,
          rawMessage,
          messageAr: 'تم إغلاق أو إلغاء نافذة تسجيل الدخول بـ Google قبل إتمام العملية.',
          messageEn: 'Google sign-in popup was closed or cancelled before completion.',
        };
      case 'auth/popup-blocked':
        return {
          code,
          rawMessage,
          messageAr: 'تم حظر نافذة تسجيل الدخول المنبثقة من قِبل المتصفح.',
          messageEn: 'Sign-in popup was blocked by browser settings.',
        };
      case 'auth/redirect-initiated':
        return {
          code,
          rawMessage,
          messageAr: 'تم حظر النافذة المنبثقة وجارٍ التحويل عبر إعادة التوجيه (Redirect).',
          messageEn: 'Popup was blocked; redirect flow initiated.',
        };
      case 'auth/account-exists-with-different-credential':
        return {
          code,
          rawMessage,
          messageAr: 'يوجد حساب مسجل بنفس البريد الإلكتروني بطريقة دخول مختلفة.',
          messageEn: 'An account already exists with the same email address but different sign-in credentials.',
        };
      case 'auth/too-many-requests':
        return {
          code,
          rawMessage,
          messageAr: 'تم تقديم محاولات كثيرة خاطئة. تم إيقاف المحاولات مؤقتاً من Firebase.',
          messageEn: 'Too many failed attempts. Please try again later.',
        };
      case 'auth/network-request-failed':
        return {
          code,
          rawMessage,
          messageAr: 'فشل الاتصال بخوادم Firebase عبر الشبكة.',
          messageEn: 'Network error communicating with Firebase Auth.',
        };
      case 'auth/invalid-continue-uri':
        return {
          code,
          rawMessage,
          messageAr: 'رابط إعادة التوجيه في Firebase غير مصرح به أو غير صالح.',
          messageEn: 'The continue URL provided in the request is invalid or not whitelisted.',
        };
      case 'auth/missing-continue-uri':
        return {
          code,
          rawMessage,
          messageAr: 'رابط العودة مطلوب لإكمال العملية.',
          messageEn: 'A valid continue URL must be provided in the request.',
        };
      case 'auth/invalid-action-code':
        return {
          code,
          rawMessage,
          messageAr: 'رمز تفعيل الحساب أو استعادة كلمة المرور غير صالح أو منتهي الصلاحية.',
          messageEn: 'The action code is invalid, expired, or already used.',
        };
      case 'auth/not-configured':
        return {
          code,
          rawMessage,
          messageAr: 'تهيئة Firebase Authentication غير مكتملة أو كائن Auth غير متوفر.',
          messageEn: 'Firebase configuration is incomplete or uninitialized.',
        };
      default:
        return {
          code,
          rawMessage,
          messageAr: error?.message || 'حدث خطأ أثناء المصادقة في Firebase.',
          messageEn: error?.message || 'An authentication error occurred.',
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
   * Helper to synchronize or create user document in Firestore and return domain AuthUser + separate Firestore diagnostic
   */
  static async syncUserProfileWithDiagnostics(
    user: FirebaseUser,
    providerId: string
  ): Promise<{ authUser: AuthUser; firestoreError: { code: string; message: string } | null }> {
    let userRole: 'admin' | 'user' = 'user';
    let userCredits = 50;
    let tier: 'free' | 'pro' | 'enterprise' = 'free';
    let firestoreError: { code: string; message: string } | null = null;

    const userEmail = (user.email || '').toLowerCase();
    const isAdmin = userEmail === 'ahmed@moulin.ai' || userEmail === 'bdwe.swerke.bdwe@gmail.com';
    if (isAdmin) userRole = 'admin';

    if (db) {
      try {
        console.info('📄 [Firestore Diagnostic] Reading profile document:', `users/${user.uid}`);
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.info('📄 [Firestore Diagnostic] Profile document not found, creating:', `users/${user.uid}`);
          await setDoc(userRef, {
            uid: user.uid,
            fullName: user.displayName || (userEmail ? userEmail.split('@')[0] : 'مستخدم MOLAN AI'),
            email: user.email,
            photoURL: user.photoURL,
            provider: providerId,
            emailVerified: user.emailVerified,
            role: isAdmin ? 'admin' : 'user',
            credits: 50,
            tier: 'free',
            accountStatus: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.info('✅ [Firestore Diagnostic] Profile document created successfully:', `users/${user.uid}`);
        } else {
          const data = userSnap.data();
          userRole = data.role || (isAdmin ? 'admin' : 'user');
          userCredits = data.credits ?? 50;
          tier = data.tier || 'free';
          console.info('✅ [Firestore Diagnostic] Profile document loaded successfully:', {
            path: `users/${user.uid}`,
            role: userRole,
            tier,
          });
        }
      } catch (e: any) {
        const fsCode = e?.code || 'firestore/unknown';
        const fsMessage = e?.message || String(e || 'Unknown Firestore error');
        firestoreError = { code: fsCode, message: fsMessage };
        console.error('❌ [Firestore Diagnostic] Firebase Auth succeeded, but Firestore profile sync failed:', {
          stage: 'firestore_profile',
          uid: user.uid,
          code: fsCode,
          message: fsMessage,
        });
      }
    } else {
      firestoreError = {
        code: 'firestore/not-initialized',
        message: 'Firestore database instance (db) is null.',
      };
      console.error('❌ [Firestore Diagnostic] Firestore db instance is null.');
    }

    return {
      authUser: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (userEmail ? userEmail.split('@')[0] : 'مستخدم MOLAN AI'),
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        providerId,
        role: userRole,
        credits: userCredits,
        tier,
      },
      firestoreError,
    };
  }

  /**
   * Backwards-compatible wrapper returning AuthUser directly
   */
  static async syncUserProfile(user: FirebaseUser, providerId: string): Promise<AuthUser> {
    const { authUser } = await this.syncUserProfileWithDiagnostics(user, providerId);
    return authUser;
  }

  /**
   * Sign in with Google (Popup, with Redirect only if browser blocks popup)
   */
  static async loginWithGoogle(): Promise<{ authUser: AuthUser; firestoreError: { code: string; message: string } | null }> {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw { code: 'auth/not-configured', message: 'Firebase Auth is not initialized.' };
    }

    console.info('🔐 [Auth Diagnostic] Stage: auth_google -> Calling signInWithPopup...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.info('✅ [Auth Diagnostic] Stage: auth_google succeeded:', {
        uid: result.user.uid,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
      });
      return await this.syncUserProfileWithDiagnostics(result.user, 'google.com');
    } catch (err: any) {
      console.error('❌ [Auth Diagnostic] Stage: auth_google failed:', {
        code: err?.code || 'auth/unknown',
        message: err?.message || String(err),
        origin: typeof window !== 'undefined' ? window.location.origin : 'server',
      });

      if (err?.code === 'auth/popup-blocked') {
        try {
          console.info('🔐 [Auth Diagnostic] Popup blocked -> Attempting signInWithRedirect fallback...');
          await signInWithRedirect(auth, googleProvider);
          throw { code: 'auth/redirect-initiated', message: 'Redirect initiated after popup blocked.' };
        } catch (redirectErr: any) {
          console.error('❌ [Auth Diagnostic] signInWithRedirect fallback failed:', {
            code: redirectErr?.code || 'auth/unknown',
            message: redirectErr?.message || String(redirectErr),
          });
          throw redirectErr?.code === 'auth/redirect-initiated' ? redirectErr : err;
        }
      }
      throw err;
    }
  }

  /**
   * Register with Email and Password
   */
  static async registerWithEmail(
    credentials: RegisterCredentials
  ): Promise<{ authUser: AuthUser; firestoreError: { code: string; message: string } | null }> {
    if (!isFirebaseConfigured || !auth) {
      throw { code: 'auth/not-configured', message: 'Firebase Auth is not initialized.' };
    }

    const { fullName, email, password } = credentials;

    if (!password) {
      throw { code: 'auth/missing-password', message: 'كلمة المرور مطلوبة' };
    }

    console.info('🔐 [Auth Diagnostic] Stage: auth_register -> Calling createUserWithEmailAndPassword...', {
      emailDomain: email.trim().split('@')[1] || 'unknown',
    });

    let result;
    try {
      result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      console.info('✅ [Auth Diagnostic] Stage: auth_register succeeded:', {
        uid: result.user.uid,
        email: result.user.email,
      });
    } catch (err: any) {
      console.error('❌ [Auth Diagnostic] Stage: auth_register failed:', {
        code: err?.code || 'auth/unknown',
        message: err?.message || String(err),
      });
      throw err;
    }

    const user = result.user;

    if (fullName) {
      try {
        await updateProfile(user, { displayName: fullName.trim() });
      } catch (e: any) {
        console.warn('⚠️ [Auth Diagnostic] Could not update display name:', e?.code || e?.message || e);
      }
    }

    try {
      await sendEmailVerification(user);
    } catch (e: any) {
      console.warn('⚠️ [Auth Diagnostic] Initial verification email send warning:', {
        code: e?.code || 'auth/unknown',
        message: e?.message || String(e),
      });
    }

    return await this.syncUserProfileWithDiagnostics(user, 'password');
  }

  /**
   * Sign in with Email and Password (strict, transparent Firebase error reporting)
   */
  static async loginWithEmail(
    credentials: LoginCredentials
  ): Promise<{ authUser: AuthUser; firestoreError: { code: string; message: string } | null }> {
    if (!isFirebaseConfigured || !auth) {
      throw { code: 'auth/not-configured', message: 'Firebase Auth is not initialized.' };
    }

    const { email, password } = credentials;

    if (!password) {
      throw { code: 'auth/missing-password', message: 'يرجى إدخال كلمة المرور' };
    }

    console.info('🔐 [Auth Diagnostic] Stage: auth_email -> Calling signInWithEmailAndPassword...', {
      emailDomain: email.trim().split('@')[1] || 'unknown',
    });

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      console.info('✅ [Auth Diagnostic] Stage: auth_email succeeded:', {
        uid: result.user.uid,
        email: result.user.email,
        emailVerified: result.user.emailVerified,
      });
      return await this.syncUserProfileWithDiagnostics(result.user, 'password');
    } catch (err: any) {
      console.error('❌ [Auth Diagnostic] Stage: auth_email failed:', {
        code: err?.code || 'auth/unknown',
        message: err?.message || String(err),
        origin: typeof window !== 'undefined' ? window.location.origin : 'server',
      });
      throw err;
    }
  }

  /**
   * Send Password Reset Email
   */
  static async sendPasswordReset(email: string): Promise<void> {
    if (!isFirebaseConfigured || !auth) {
      throw { code: 'auth/not-configured' };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
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

    try {
      await sendEmailVerification(auth.currentUser);
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
