import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Enable persistent cache using IndexedDB
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
}, firebaseConfig.firestoreDatabaseId);

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
