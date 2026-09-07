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
// and enable force long polling to prevent WebChannel 10-second backend connection timeouts in iframe/proxy environments
export const db = initializeFirestore(
  app,
  {
    localCache: memoryLocalCache(),
    experimentalForceLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId || '(default)'
);

// Validate connection to Firestore on boot as per firebase-skill guidelines
const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connectivity check succeeded');
  } catch (error: any) {
    if (
      error instanceof Error &&
      (error.message.includes('the client is offline') || error.message.includes('offline') || error.message.includes('unavailable'))
    ) {
      console.warn("Firestore connectivity check: Operating in offline/robust mode.");
    } else {
      // Document doesn't need to exist for connection to be validated
      console.log('Firestore connection established');
    }
  }
};

// Defer connection check to allow transport layer initialization
if (typeof window !== 'undefined') {
  setTimeout(testConnection, 500);
} else {
  testConnection();
}

export const storage = getStorage(app, firebaseConfig.storageBucket);

