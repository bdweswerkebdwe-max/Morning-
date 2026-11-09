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

  // Default fallback demo user for offline/pre-configured state
  const demoAdminUser: AuthUser = {
    uid: 'demo_admin_uid_123',
    email: 'ahmed@moulin.ai',
    displayName: 'أحمد الإداري (MOLAN AI)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    emailVerified: true,
    providerId: 'password',
    role: 'admin',
    credits: 500,
    tier: 'pro',
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // Run connection test
    testFirestoreConnection();

    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          let role: 'admin' | 'user' = 'user';
          let credits = 50;

          // Fetch or create profile document in Firestore if database is ready
          if (db) {
            try {
              const userRef = doc(db, 'users', firebaseUser.uid);
              const snap = await getDoc(userRef);
              if (snap.exists()) {
                const data = snap.data();
                role = data.role || 'user';
                credits = data.credits ?? 50;
              } else {
                await setDoc(userRef, {
                  uid: firebaseUser.uid,
                  fullName: firebaseUser.displayName || 'مستخدم MOLAN AI',
                  email: firebaseUser.email,
                  photoURL: firebaseUser.photoURL,
                  provider: firebaseUser.providerData[0]?.providerId || 'google.com',
                  emailVerified: firebaseUser.emailVerified,
                  role: 'user',
                  credits: 50,
                  accountStatus: 'active',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                });
              }
            } catch (e) {
              console.error('Error fetching/creating user document in Firestore:', e);
            }
          }

          const mapped = AuthService.mapFirebaseUser(firebaseUser, { role, credits });
          setUser(mapped);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    } else {
      setUser(null);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured) {
        // Fallback for code preview before Firebase env vars are set
        setUser({
          ...demoAdminUser,
          providerId: 'google.com',
          displayName: 'مستخدم Google (تجريبي)',
        });
        setLoading(false);
        return;
      }
      const authUser = await AuthService.loginWithGoogle();
      setUser(authUser);
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
      if (!isFirebaseConfigured) {
        setUser({
          ...demoAdminUser,
          email: credentials.email,
          displayName: credentials.email.split('@')[0],
        });
        setLoading(false);
        return;
      }
      const authUser = await AuthService.loginWithEmail(credentials);
      setUser(authUser);
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
      if (!isFirebaseConfigured) {
        setUser({
          uid: 'new_user_' + Date.now(),
          email: credentials.email,
          displayName: credentials.fullName,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          emailVerified: false,
          providerId: 'password',
          role: 'user',
          credits: 50,
        });
        setLoading(false);
        return;
      }
      const authUser = await AuthService.registerWithEmail(credentials);
      setUser(authUser);
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
      if (!isFirebaseConfigured) {
        // Fallback simulation
        await new Promise((resolve) => setTimeout(resolve, 800));
        setLoading(false);
        return;
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
      if (isFirebaseConfigured) {
        await AuthService.sendEmailVerificationEmail();
      }
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
      if (isFirebaseConfigured) {
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
