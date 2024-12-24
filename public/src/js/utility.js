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
    return await dbPromise
        .then(function(db) {
            let transaction = db.transaction(storeData, 'readonly')
            let store = transaction.objectStore(storeData);
            return store.getAll();
        })
}