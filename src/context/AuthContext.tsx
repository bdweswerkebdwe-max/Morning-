import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, testFirestoreConnection } from '../config/firebase';
import { AuthService } from '../services/authService';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  getIdToken: () => Promise<string | null>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (credentials: LoginCredentials) => Promise<void>;
  registerWithEmail: (credentials: RegisterCredentials) => Promise<void>;
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

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Run connection test
    testFirestoreConnection();

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser: FirebaseUser | null) => {
          try {
            if (firebaseUser) {
              let token: string | undefined = undefined;
              try {
                token = await firebaseUser.getIdToken();
              } catch (tokenErr) {
                console.warn('⚠️ Warning getting Firebase ID token on auth state change:', tokenErr);
              }

              let role: 'admin' | 'user' = 'user';
              let credits = 50;
              let tier: 'free' | 'pro' | 'enterprise' = 'free';

              const userEmail = (firebaseUser.email || '').toLowerCase();
              const isAdmin = userEmail === 'ahmed@moulin.ai' || userEmail === 'bdwe.swerke.bdwe@gmail.com';
              if (isAdmin) role = 'admin';

              // Fetch or create profile document in Firestore ywsf-al-zaka (non-blocking for Auth)
              if (db) {
                try {
                  const userRef = doc(db, 'users', firebaseUser.uid);
                  const snap = await getDoc(userRef);
                  if (snap.exists()) {
                    const data = snap.data();
                    role = data.role || (isAdmin ? 'admin' : 'user');
                    credits = data.credits ?? 50;
                    tier = data.tier || 'free';
                  } else {
                    await setDoc(userRef, {
                      uid: firebaseUser.uid,
                      fullName: firebaseUser.displayName || (userEmail ? userEmail.split('@')[0] : 'مستخدم MOLAN AI'),
                      email: firebaseUser.email,
                      photoURL: firebaseUser.photoURL,
                      provider: firebaseUser.providerData[0]?.providerId || 'google.com',
                      emailVerified: firebaseUser.emailVerified,
                      role: isAdmin ? 'admin' : 'user',
                      credits: 50,
                      tier: 'free',
                      accountStatus: 'active',
                      createdAt: serverTimestamp(),
                      updatedAt: serverTimestamp(),
                    });
                  }
                } catch (firestoreErr) {
                  console.warn('⚠️ Firestore profile sync warning (Firebase Auth preserved):', firestoreErr);
                }
              }

              const mapped = AuthService.mapFirebaseUser(firebaseUser, { role, credits });
              setUser({
                ...mapped,
                tier,
                token,
              });
            } else {
              setUser(null);
            }
          } catch (onAuthErr) {
            console.error('❌ Error handling onAuthStateChanged callback:', onAuthErr);
          } finally {
            setLoading(false);
          }
        },
        (error: any) => {
          console.error('❌ onAuthStateChanged error listener triggered:', error);
          const formatted = AuthService.formatAuthError(error);
          setError(formatted.messageAr);
          setLoading(false);
        }
      );
    } else {
      setUser(null);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getIdToken = async (): Promise<string | null> => {
    if (auth && auth.currentUser) {
      try {
        return await auth.currentUser.getIdToken();
      } catch (e) {
        console.error('Error getting Firebase ID token:', e);
        return null;
      }
    }
    return null;
  };

  const clearError = () => setError(null);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured' };
      }
      const authUser = await AuthService.loginWithGoogle();
      let token: string | undefined = undefined;
      try {
        token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      } catch (tokenErr) {
        console.warn('Could not fetch token immediately after login:', tokenErr);
      }
      setUser({ ...authUser, token });
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      setError(formatted.messageAr);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured' };
      }
      const authUser = await AuthService.loginWithEmail(credentials);
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      setUser({ ...authUser, token });
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      setError(formatted.messageAr);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured' };
      }
      const authUser = await AuthService.registerWithEmail(credentials);
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      setUser({ ...authUser, token });
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      setError(formatted.messageAr);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured' };
      }
      await AuthService.sendPasswordReset(email);
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      setError(formatted.messageAr);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw { code: 'auth/not-configured' };
      }
      await AuthService.sendEmailVerificationEmail();
    } catch (err: any) {
      const formatted = AuthService.formatAuthError(err);
      setError(formatted.messageAr);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await AuthService.logout();
      }
      setUser(null);
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
        isConfigured: isFirebaseConfigured,
        getIdToken,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
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
