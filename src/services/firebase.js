import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  initializeFirestore,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';

// Firebase configuration from environment variables
// Set these in your .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
const isFirebaseConfigured = firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase is not configured. Authentication features will be disabled.');
  console.warn('📝 Add your Firebase credentials to .env file to enable auth.');
  console.warn('📖 See FIREBASE_SETUP.md for instructions.');
  console.warn('💡 You can still browse repositories without authentication!');
}

// Initialize Firebase only if properly configured
let app, auth, db, googleProvider;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Use auto-detected long polling to avoid WebChannel transport issues in some networks
    db = initializeFirestore(app, { experimentalForceLongPolling: true, experimentalAutoDetectLongPolling: true });
    googleProvider = new GoogleAuthProvider();
    console.log('✅ Firebase configured successfully!');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.warn('⚠️ Authentication features will be disabled.');
  }
}

// Auth functions
export const signUpWithEmail = async (email, password, displayName) => {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('Firebase is not configured. Please set up Firebase credentials in .env file.');
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || '',
      techStack: [],
      bio: '',
      savedRepos: [],
      createdAt: new Date().toISOString(),
      onboardingComplete: false
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const signInWithEmail = async (email, password) => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured. Please set up Firebase credentials in .env file.');
  }
  
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('Firebase is not configured. Please set up Firebase credentials in .env file.');
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        techStack: [],
        bio: '',
        savedRepos: [],
        createdAt: new Date().toISOString(),
        onboardingComplete: false
      });
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured.');
  }
  
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// User data functions
export const getUserData = async (uid) => {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase not configured, returning null user data');
    return null;
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateUserData = async (uid, data) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Cannot update user data.');
  }
  
  try {
    // Use setDoc with merge to create document if it doesn't exist yet
    await setDoc(doc(db, 'users', uid), data, { merge: true });
  } catch (error) {
    throw error;
  }
};

export const saveRepo = async (uid, repoId) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Cannot save repositories.');
  }
  
  try {
    await updateDoc(doc(db, 'users', uid), {
      savedRepos: arrayUnion(repoId)
    });
  } catch (error) {
    throw error;
  }
};

export const unsaveRepo = async (uid, repoId) => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured. Cannot unsave repositories.');
  }
  
  try {
    await updateDoc(doc(db, 'users', uid), {
      savedRepos: arrayRemove(repoId)
    });
  } catch (error) {
    throw error;
  }
};

// Export Firebase instances and helper
export { auth, db, onAuthStateChanged };
export { isFirebaseConfigured };

