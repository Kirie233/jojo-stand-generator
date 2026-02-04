const DB_NAME = 'JojoStandDB';
const DB_VERSION = 3;
const STORE_NAME = 'stands';

export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create store with 'id' as keyPath
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Create index for timestamp to sort history
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const saveStandToDB = async (standData) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Ensure ID exists
    if (!standData.id) {
      standData.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
    }

    // Ensure Timestamp exists
    if (!standData.timestamp) {
      standData.timestamp = Date.now();
    }

    store.put(standData);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        console.log("Stand saved to IndexedDB:", standData.name);
        resolve(standData);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to save to DB:", err);
    throw err;
  }
};

export const getAllStandsFromDB = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp'); // Sort by time

    const request = index.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        // Reverse to show newest first
        const result = request.result || [];
        resolve(result.reverse());
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Failed to get from DB:", err);
    return [];
  }
};

export const deleteStandFromDB = async (id) => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error("Failed to delete:", err);
  }
};

export const clearDB = async () => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  } catch (err) {
    console.error("Failed to clear DB:", err);
  }
}
