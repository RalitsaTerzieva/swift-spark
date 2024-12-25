const { openDB } = idb;


let dbPromise;

async function initializeDB() {
    dbPromise = await openDB('my-database', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('posts')) {
                db.createObjectStore('posts', { keyPath: 'id' });
            }
        }
    });
    console.log('Database initialized:', dbPromise);
}


async function writeData(storeName, data) {
    const db = await dbPromise;
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.put(data); // Add the data to the object store
    await transaction.complete; // Ensure the transaction completes
    return dbPromise;
}

async function readAllData(storeData) {

    // Check if dbPromise is properly initialized
    if (!dbPromise) {
        console.log('Database not initialized yet.');
        return [];
    }

    try {
        const db = await dbPromise; // Ensure dbPromise is resolved and contains a valid database instance
        const transaction = db.transaction(storeData, 'readonly');
        const store = transaction.objectStore(storeData);
        const data = await store.getAll();
        console.log('Data read from IndexedDB:', data);
        return data;
    } catch (error) {
        console.error('Error reading data from IndexedDB:', error);
        return [];
    }
}

async function clearAllData(storeName) {
    try {
        const db = await dbPromise; // Resolve the database instance
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        await store.clear(); // Clear the object store
        await transaction.done; // Ensure the transaction is complete

        console.log(`All data cleared from ${storeName}.`);
    } catch (error) {
        console.error('Error clearing data from IndexedDB:', error);
    }
}

