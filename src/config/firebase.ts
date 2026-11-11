import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Detect environment variable overrides vs firebase-applet-config.json
const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || envApiKey || '',
  authDomain: firebaseAppletConfig.authDomain || envAuthDomain || '',
  projectId: firebaseAppletConfig.projectId || envProjectId || '',
  storageBucket: firebaseAppletConfig.storageBucket || envStorageBucket || '',
  messagingSenderId: firebaseAppletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseAppletConfig.appId || envAppId || '',
};

// Check env conflict for diagnostic logging
if (envProjectId && envProjectId !== firebaseAppletConfig.projectId) {
  console.warn(`[Firebase Diagnostic] Conflict detected: VITE_FIREBASE_PROJECT_ID (${envProjectId}) differs from firebase-applet-config.json (${firebaseAppletConfig.projectId}). Using firebase-applet-config.json.`);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let initializationError: string | null = null;

const hasRequiredFields = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (hasRequiredFields) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    
    const dbId = (firebaseAppletConfig as any).firestoreDatabaseId;
    db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    storage = getStorage(app);
    
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });

    console.log('🔥 [Firebase Status] Successfully initialized Firebase instance for project:', firebaseConfig.projectId);
  } catch (error: any) {
    initializationError = error?.message || String(error);
    console.error('❌ [Firebase Status] Error initializing Firebase client:', error);
    app = null;
    auth = null;
    db = null;
    storage = null;
    googleProvider = null;
  }
} else {
  initializationError = 'Missing required Firebase configuration fields (apiKey, authDomain, projectId, appId).';
  console.info('ℹ️ [Firebase Status] Firebase configuration is incomplete or pending setup.');
}

// Only ready if app and auth instance exist and initialization succeeded
export const isFirebaseConfigured: boolean = Boolean(app && auth && !initializationError);

/**
 * Validates connection to Firestore from server/client as required by Firebase skill
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firestore connection test succeeded!');
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('❌ Please check your Firebase configuration.');
    } else {
      console.warn('Firestore connection info:', error?.message || error);
    }
    return false;
  }
}

export { app, auth, db, storage, googleProvider, firebaseConfig, initializationError };

