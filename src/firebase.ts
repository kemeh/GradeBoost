import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use memoryLocalCache to prevent QuotaExceededError in browser iframe storage
// and enable experimentalAutoDetectLongPolling to ensure reliable backend connectivity in iframes/sandboxes
export const db = initializeFirestore(
  app,
  {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true,
  },
  firebaseConfig.firestoreDatabaseId
);

export const storage = getStorage(app, firebaseConfig.storageBucket);

async function testStorageConnection() {
  try {
    const storageRef = ref(storage, 'test-connection');
    console.log('Storage bucket being used:', storage.app.options.storageBucket);
  } catch (error) {
    console.error("Storage initialization error:", error);
  }
}
testStorageConnection();

