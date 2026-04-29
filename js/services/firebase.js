/**
 * Firebase Service — Authentication & Firestore integration
 * Provides anonymous auth and data persistence for quiz scores/profiles.
 * 
 * WHY Firebase:
 * - Anonymous auth lets users save progress without creating accounts
 * - Firestore stores quiz leaderboard data serverlessly
 * - Firebase Hosting provides free SSL and CDN for deployment
 * 
 * SETUP: Replace config below with your Firebase project config.
 * Get yours at https://console.firebase.google.com
 */

const FIREBASE_CONFIG = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let firebaseApp = null;
let auth = null;
let db = null;

/** Initialize Firebase (lazy — only when needed) */
export async function initFirebase() {
  if (firebaseApp) return { auth, db };
  
  try {
    // Dynamic import of Firebase SDK from CDN
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
    const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
    
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    
    console.log('Firebase initialized');
    return { auth, db };
  } catch (e) {
    console.warn('Firebase init failed (API key not configured):', e.message);
    return { auth: null, db: null };
  }
}

/** Sign in anonymously */
export async function signInAnon() {
  try {
    const { auth } = await initFirebase();
    if (!auth) return null;
    const { signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (e) {
    console.warn('Anonymous sign-in failed:', e.message);
    return null;
  }
}

/** Save quiz score to Firestore */
export async function saveQuizScore(userId, score, total) {
  try {
    const { db } = await initFirebase();
    if (!db) return;
    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
    await addDoc(collection(db, 'quizScores'), {
      userId, score, total, 
      percentage: Math.round((score / total) * 100),
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.warn('Failed to save score:', e.message);
  }
}
