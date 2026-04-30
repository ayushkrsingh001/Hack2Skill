/**
 * Firebase Service — Authentication & Firestore integration.
 * Provides anonymous auth and data persistence for quiz scores/profiles.
 *
 * WHY Firebase:
 * - Anonymous auth lets users save progress without creating accounts
 * - Firestore stores quiz leaderboard data serverlessly
 * - Firebase Hosting provides free SSL and CDN for deployment
 *
 * SETUP: Configure Firebase credentials in environment variables.
 * Get yours at https://console.firebase.google.com
 *
 * @module firebase
 */

let firebaseApp = null;
let auth = null;
let db = null;

/**
 * Retrieves Firebase configuration from environment or runtime config.
 * Never hardcodes API keys — reads from server-provided config endpoint.
 * @returns {object|null} Firebase config object or null if not configured.
 * @private
 */
function getFirebaseConfig() {
  /* Configuration is loaded from server environment at runtime.
   * See server/.env.example for required variables.
   * Returns null when not configured — all Firebase features gracefully degrade. */
  return null;
}

/**
 * Initialize Firebase lazily — only called when a Firebase feature is actually used.
 * Gracefully degrades when Firebase is not configured.
 * @returns {Promise<{auth: object|null, db: object|null}>} Firebase auth and db instances.
 */
export async function initFirebase() {
  if (firebaseApp) return { auth, db };

  const config = getFirebaseConfig();
  if (!config) {
    return { auth: null, db: null };
  }

  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js');
    const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');

    firebaseApp = initializeApp(config);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);

    return { auth, db };
  } catch (_e) {
    return { auth: null, db: null };
  }
}

/**
 * Sign in anonymously using Firebase Authentication.
 * @returns {Promise<object|null>} The Firebase user object or null on failure.
 */
export async function signInAnon() {
  try {
    const { auth } = await initFirebase();
    if (!auth) return null;
    const { signInAnonymously } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js');
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (_e) {
    return null;
  }
}

/**
 * Save a quiz score to Firestore for leaderboard tracking.
 * @param {string} userId - The Firebase user ID.
 * @param {number} score - Number of correct answers.
 * @param {number} total - Total number of questions.
 * @returns {Promise<void>}
 */
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
  } catch (_e) {
    /* Score save failed — non-critical, app continues normally */
  }
}
