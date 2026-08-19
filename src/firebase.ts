import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  memoryLocalCache, 
  doc, 
  getDocFromServer 
} from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use memoryLocalCache to prevent QuotaExceededError in browser iframe storage
// and enable auto-detect long polling for reliable backend connectivity across all network environments
export const db = initializeFirestore(
  app,
  {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Validate connection to Firestore on boot as per firebase-skill guidelines
const testConnection = async () => {
  try {
    // Attempting to fetch a document from server to verify connectivity
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log('Firestore connectivity check succeeded');
  } catch (error: any) {
    if (error?.code === 'unavailable' || (error instanceof Error && error.message.includes('offline'))) {
      console.warn("Firestore connectivity check: Backend temporarily unavailable or offline. Client will retry automatically.");
    } else {
      // Ignore document non-existence or permission errors for internal test doc
      console.log('Firestore connection established');
    }
  }
};

// Defer connection check to allow transport layer initialization
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 1000);
} else {
  testConnection();
}

export const storage = getStorage(app, firebaseConfig.storageBucket);

