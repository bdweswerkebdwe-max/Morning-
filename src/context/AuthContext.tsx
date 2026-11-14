import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { onAuthStateChanged, getRedirectResult, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured, testFirestoreConnection, getFirebaseDiagnostics } from '../config/firebase';
import { AuthService } from '../services/authService';
import { AuthUser, LoginCredentials, RegisterCredentials, AuthDiagnostic, AuthStage } from '../types/auth';

const STAGE_LABELS_AR: Record<AuthStage, string> = {
  idle: 'جاهز',
  firebase_init: 'تهيئة Firebase SDK',
  auth_google: 'مصادقة Google عبر Firebase Authentication',
  auth_email: 'مصادقة البريد وكلمة المرور عبر Firebase Authentication',
  auth_register: 'إنشاء حساب جديد عبر Firebase Authentication',
  auth_reset: 'إرسال رابط استعادة كلمة المرور',
  auth_verify: 'إرسال بريد تفعيل الحساب',
  id_token: 'استخراج رمز الجلسة (ID Token)',
  auth_state_listener: 'مراقب حالة الجلسة (onAuthStateChanged)',
  firestore_profile: 'قراءة/إنشاء ملف المستخدم في Firestore (users/{uid})',
};

function buildInitialDiagnostic(): AuthDiagnostic {
  const fbDiag = getFirebaseDiagnostics();
  return {
    stage: fbDiag.isConfigured ? 'idle' : 'firebase_init',
    stageLabelAr: fbDiag.isConfigured ? STAGE_LABELS_AR.idle : STAGE_LABELS_AR.firebase_init,
    authSuccess: false,
    onAuthStateChangedFired: false,
    idTokenSuccess: null,
    firestoreSuccess: null,
    errorCode: fbDiag.isConfigured ? null : 'auth/not-configured',
    errorMessage: fbDiag.initializationError,
    firestoreErrorCode: null,
    firestoreErrorMessage: null,
    projectId: fbDiag.projectId,
    authDomain: fbDiag.authDomain,
    currentOrigin: fbDiag.currentOrigin,
    timestamp: new Date().toISOString(),
  };
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  diagnostic: AuthDiagnostic;
  isConfigured: boolean;
  getIdToken: () => Promise<string | null>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (credentials: LoginCredentials) => Promise<void>;
  registerWithEmail: (credentials: RegisterCredentials) => Promise<void>;
  loginWithDemoAccount: (asAdmin?: boolean) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<AuthDiagnostic>(() => buildInitialDiagnostic());

  const updateDiagnostic = useCallback((patch: Partial<AuthDiagnostic>) => {
    setDiagnostic((prev) => ({
      ...prev,
      ...patch,
      stageLabelAr: patch.stage ? STAGE_LABELS_AR[patch.stage] : prev.stageLabelAr,
      timestamp: new Date().toISOString(),
    }));
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Run connection test
    testFirestoreConnection();

    // Check saved demo user session in localStorage as fallback
    const savedDemoUser = localStorage.getItem('molan_demo_user');
    if (savedDemoUser) {
      try {
        const parsed = JSON.parse(savedDemoUser);
        setUser(parsed);
        setLoading(false);
      } catch (e) {
        console.warn('Failed to parse saved demo user:', e);
      }
    }

    if (isFirebaseConfigured && auth) {
      // Check for OAuth redirect result (e.g. returning from Google Sign-In redirect)
      getRedirectResult(auth)
        .then(async (result) => {
          if (result && result.user) {
            console.info('✅ [Auth Diagnostic] getRedirectResult returned authenticated user:', {
              uid: result.user.uid,
              email: result.user.email,
            });
            localStorage.removeItem('molan_demo_user');
            const { authUser, firestoreError } = await AuthService.syncUserProfileWithDiagnostics(
              result.user,
              'google.com'
            );
            let token: string | undefined = undefined;
            let idTokenOk = true;
            try {
              token = await result.user.getIdToken();
            } catch (tokenErr: any) {
              idTokenOk = false;
              console.warn('⚠️ [Auth Diagnostic] Redirect getIdToken warning:', tokenErr?.code || tokenErr?.message);
            }
            setUser({ ...authUser, token });
            updateDiagnostic({
              stage: firestoreError ? 'firestore_profile' : 'auth_google',
              authSuccess: true,
              idTokenSuccess: idTokenOk,
              firestoreSuccess: !firestoreError,
              firestoreErrorCode: firestoreError?.code || null,
              firestoreErrorMessage: firestoreError?.message || null,
              errorCode: null,
              errorMessage: null,
            });
          }
        })
        .catch((redirectErr: any) => {
          const formatted = AuthService.formatAuthError(redirectErr);
          console.error('❌ [Auth Diagnostic] getRedirectResult error:', {
            code: formatted.code,
            message: formatted.rawMessage,
          });
          updateDiagnostic({
            stage: 'auth_google',
            authSuccess: false,
            errorCode: formatted.code,
            errorMessage: formatted.rawMessage,
          });
          setError(`[${formatted.code}] ${formatted.messageAr}`);
        });

      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser: FirebaseUser | null) => {
          console.info('🔔 [Auth Diagnostic] onAuthStateChanged fired:', {
            hasUser: Boolean(firebaseUser),
            uid: firebaseUser?.uid || null,
            provider: firebaseUser?.providerData?.[0]?.providerId || null,
          });

          try {
            if (firebaseUser) {
              localStorage.removeItem('molan_demo_user');

              let token: string | undefined = undefined;
              let idTokenSuccess = true;
              try {
                token = await firebaseUser.getIdToken();
                console.info('✅ [Auth Diagnostic] ID Token retrieved successfully in onAuthStateChanged.');
              } catch (tokenErr: any) {
                idTokenSuccess = false;
                console.error('❌ [Auth Diagnostic] Stage: id_token failed in onAuthStateChanged:', {
                  code: tokenErr?.code || 'auth/token-error',
                  message: tokenErr?.message || String(tokenErr),
                });
              }

              const providerId = firebaseUser.providerData[0]?.providerId || 'password';
              const { authUser, firestoreError } = await AuthService.syncUserProfileWithDiagnostics(
                firebaseUser,
                providerId
              );

              setUser({
                ...authUser,
                token,
              });

              updateDiagnostic({
                stage: firestoreError ? 'firestore_profile' : 'auth_state_listener',
                onAuthStateChangedFired: true,
                authSuccess: true,
                idTokenSuccess,
                firestoreSuccess: !firestoreError,
                firestoreErrorCode: firestoreError?.code || null,
                firestoreErrorMessage: firestoreError?.message || null,
              });
            } else {
              if (!localStorage.getItem('molan_demo_user')) {
                setUser(null);
              }
              setDiagnostic((prev) => ({
                ...prev,
                onAuthStateChangedFired: true,
                timestamp: new Date().toISOString(),
              }));
            }
          } catch (onAuthErr: any) {
            console.error('❌ [Auth Diagnostic] onAuthStateChanged callback exception:', {
              code: onAuthErr?.code || 'auth/listener-exception',
              message: onAuthErr?.message || String(onAuthErr),
            });
            updateDiagnostic({
              stage: 'auth_state_listener',
              onAuthStateChangedFired: true,
              errorCode: onAuthErr?.code || 'auth/listener-exception',
              errorMessage: onAuthErr?.message || String(onAuthErr),
            });
          } finally {
            setLoading(false);
          }
        },
        (listenerErr: any) => {
          const formatted = AuthService.formatAuthError(listenerErr);
          console.error('❌ [Auth Diagnostic] onAuthStateChanged error listener triggered:', {
            code: formatted.code,
            message: formatted.rawMessage,
          });
          if (!localStorage.getItem('molan_demo_user')) {
            setError(`[${formatted.code}] ${formatted.messageAr}`);
          }
          updateDiagnostic({
            stage: 'auth_state_listener',
            onAuthStateChangedFired: true,
            authSuccess: false,
            errorCode: formatted.code,
            errorMessage: formatted.rawMessage,
          });
          setLoading(false);
        }
      );
    } else {
      const fbDiag = getFirebaseDiagnostics();
      console.error('❌ [Auth Diagnostic] Skipping onAuthStateChanged: Firebase not configured:', fbDiag);
      if (!savedDemoUser) {
        setUser(null);
      }
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [updateDiagnostic]);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (user?.token) return user.token;
    if (auth && auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch (e: any) {
        console.error('❌ [Auth Diagnostic] Error getting Firebase ID token:', e?.code || e?.message || e);
        return null;
      }
    }
    return null;
  }, [user?.token]);

  const clearError = useCallback(() => {
    setError(null);
    setDiagnostic((prev) => ({
      ...prev,
      errorCode: null,
      errorMessage: null,
      firestoreErrorCode: null,
      firestoreErrorMessage: null,
    }));
  }, []);

  const loginWithDemoAccount = async (asAdmin: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const demoEmail = asAdmin ? 'bdwe.swerke.bdwe@gmail.com' : 'user@moulin.ai';
      const demoUser: AuthUser = {
        uid: asAdmin ? 'admin_demo_uid_1001' : 'user_demo_uid_2002',
        email: demoEmail,
        displayName: asAdmin ? 'مدير منصة MOLAN AI' : 'مستخدم معلن',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        emailVerified: true,
        providerId: 'demo',
        role: asAdmin ? 'admin' : 'user',
        credits: 100,
        tier: 'pro',
        token: 'demo-guest-token',
      };
      localStorage.setItem('molan_demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
    } catch (err: any) {
      console.error('Demo login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    updateDiagnostic({
      stage: 'auth_google',
      authSuccess: false,
      idTokenSuccess: null,
      firestoreSuccess: null,
      errorCode: null,
      errorMessage: null,
      firestoreErrorCode: null,
      firestoreErrorMessage: null,
    });

    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured', message: 'Firebase Auth is not initialized.' };
      }

      const { authUser, firestoreError } = await AuthService.loginWithGoogle();

      let token: string | undefined = undefined;
      let idTokenSuccess = true;
      try {
        token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      } catch (tokenErr: any) {
        idTokenSuccess = false;
        console.error('❌ [Auth Diagnostic] Stage: id_token failed after Google auth:', {
          code: tokenErr?.code || 'auth/token-error',
          message: tokenErr?.message || String(tokenErr),
        });
      }

      setUser({ ...authUser, token });
      updateDiagnostic({
        stage: firestoreError ? 'firestore_profile' : 'auth_google',
        authSuccess: true,
        idTokenSuccess,
        firestoreSuccess: !firestoreError,
        firestoreErrorCode: firestoreError?.code || null,
        firestoreErrorMessage: firestoreError?.message || null,
        errorCode: null,
        errorMessage: null,
      });
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      updateDiagnostic({
        stage: 'auth_google',
        authSuccess: false,
        idTokenSuccess: null,
        firestoreSuccess: null,
        errorCode: formatted.code,
        errorMessage: formatted.rawMessage,
      });
      setError(`[${formatted.code}] ${formatted.messageAr}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    updateDiagnostic({
      stage: 'auth_email',
      authSuccess: false,
      idTokenSuccess: null,
      firestoreSuccess: null,
      errorCode: null,
      errorMessage: null,
      firestoreErrorCode: null,
      firestoreErrorMessage: null,
    });

    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured', message: 'Firebase Auth is not initialized.' };
      }

      const { authUser, firestoreError } = await AuthService.loginWithEmail(credentials);

      let token: string | undefined = undefined;
      let idTokenSuccess = true;
      try {
        token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      } catch (tokenErr: any) {
        idTokenSuccess = false;
        console.error('❌ [Auth Diagnostic] Stage: id_token failed after Email auth:', {
          code: tokenErr?.code || 'auth/token-error',
          message: tokenErr?.message || String(tokenErr),
        });
      }

      setUser({ ...authUser, token });
      updateDiagnostic({
        stage: firestoreError ? 'firestore_profile' : 'auth_email',
        authSuccess: true,
        idTokenSuccess,
        firestoreSuccess: !firestoreError,
        firestoreErrorCode: firestoreError?.code || null,
        firestoreErrorMessage: firestoreError?.message || null,
        errorCode: null,
        errorMessage: null,
      });
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      updateDiagnostic({
        stage: 'auth_email',
        authSuccess: false,
        idTokenSuccess: null,
        firestoreSuccess: null,
        errorCode: formatted.code,
        errorMessage: formatted.rawMessage,
      });
      setError(`[${formatted.code}] ${formatted.messageAr}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    updateDiagnostic({
      stage: 'auth_register',
      authSuccess: false,
      idTokenSuccess: null,
      firestoreSuccess: null,
      errorCode: null,
      errorMessage: null,
      firestoreErrorCode: null,
      firestoreErrorMessage: null,
    });

    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured', message: 'Firebase Auth is not initialized.' };
      }

      const { authUser, firestoreError } = await AuthService.registerWithEmail(credentials);

      let token: string | undefined = undefined;
      let idTokenSuccess = true;
      try {
        token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      } catch (tokenErr: any) {
        idTokenSuccess = false;
        console.error('❌ [Auth Diagnostic] Stage: id_token failed after registration:', {
          code: tokenErr?.code || 'auth/token-error',
          message: tokenErr?.message || String(tokenErr),
        });
      }

      setUser({ ...authUser, token });
      updateDiagnostic({
        stage: firestoreError ? 'firestore_profile' : 'auth_register',
        authSuccess: true,
        idTokenSuccess,
        firestoreSuccess: !firestoreError,
        firestoreErrorCode: firestoreError?.code || null,
        firestoreErrorMessage: firestoreError?.message || null,
        errorCode: null,
        errorMessage: null,
      });
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      updateDiagnostic({
        stage: 'auth_register',
        authSuccess: false,
        idTokenSuccess: null,
        firestoreSuccess: null,
        errorCode: formatted.code,
        errorMessage: formatted.rawMessage,
      });
      setError(`[${formatted.code}] ${formatted.messageAr}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    updateDiagnostic({
      stage: 'auth_reset',
      errorCode: null,
      errorMessage: null,
    });
    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured', message: 'Firebase Auth is not initialized.' };
      }
      await AuthService.sendPasswordReset(email);
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      updateDiagnostic({
        stage: 'auth_reset',
        errorCode: formatted.code,
        errorMessage: formatted.rawMessage,
      });
      setError(`[${formatted.code}] ${formatted.messageAr}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    setLoading(true);
    setError(null);
    updateDiagnostic({
      stage: 'auth_verify',
      errorCode: null,
      errorMessage: null,
    });
    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured', message: 'Firebase Auth is not initialized.' };
      }
      await AuthService.sendEmailVerificationEmail();
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      updateDiagnostic({
        stage: 'auth_verify',
        errorCode: formatted.code,
        errorMessage: formatted.rawMessage,
      });
      setError(`[${formatted.code}] ${formatted.messageAr}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('molan_demo_user');
      if (isFirebaseConfigured && auth) {
        await AuthService.logout();
      }
      setUser(null);
      setDiagnostic(buildInitialDiagnostic());
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        diagnostic,
        isConfigured: isFirebaseConfigured,
        getIdToken,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginWithDemoAccount,
        resetPassword,
        sendVerificationEmail,
        logout,
        clearError,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

