const { openDB } = idb;


let dbPromise;
let syncPosts;

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

async function initializeSyncPosts() {
    console.log('Initializing the sync-posts database...');
    syncPosts = await openDB('sync-posts', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('sync-posts')) {
                console.log('Creating object store "sync-posts"');
                db.createObjectStore('sync-posts', { keyPath: 'id' });
            }
        }
    });
    console.log('SyncPosts Database initialized:', syncPosts);
}


async function writeData(storeName, data) {
    try {
        console.log('writeData called with:', storeName, data);
        const db = await dbPromise;
        console.log('Database instance:', db);

        if (!db) {
            throw new Error('Database not initialized.');
        }

        const transaction = db.transaction(storeName, 'readwrite');
        console.log('Transaction created:', transaction);

        const store = transaction.objectStore(storeName);
        console.log('Object store accessed:', store);

        store.put(data); // Add the data to the object store
        await transaction.complete; // Ensure the transaction completes
        console.log('Data successfully written to store:', storeName);

        return dbPromise;
    } catch (error) {
        console.error('Error in writeData:', error);
        throw error; // Re-throw the error for further handling
    }
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

async function deleteItemFromData(storeToUse, id) {
    try {
        const db = await dbPromise; // Resolve the database instance
        const transaction = db.transaction(storeToUse, 'readwrite');
        const store = transaction.objectStore(storeToUse);

        await store.delete(id);
        await transaction.done;

        console.log(`The item cleared from ${storeToUse}.`);
    } catch (error) {
        console.error('Error clearing data from IndexedDB:', error);
    }
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);
  
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  
    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
  
    // create a view into the buffer
    var ia = new Uint8Array(ab);
  
    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
  
    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], {type: mimeString});
    return blob;
  
  }

