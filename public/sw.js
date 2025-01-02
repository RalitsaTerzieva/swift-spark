importScripts('https://cdn.jsdelivr.net/npm/idb/build/iife/index-min.js');
importScripts('/src/js/utility.js');


const CACHE_STATIC_NAME = 'static-v29';
const CACHE_DYNAMIC_NAME = 'dynamic-v7';
const STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/idb.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    // 'https://fonts.googleapis.com/css?family=Roboto:400,700',
    // 'https://fonts.googleapis.com/icon?family=Material+Icons',
    // 'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

let indexDbVersion = 1;

this.addEventListener('install', function(event) {
    console.log('Installing Service worker...', event)
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache) {
                console.log('Precaching App Shell')
                cache.addAll(STATIC_FILES)
            })
            .catch(function(error) {
                console.error('Precaching failed:', error);
            })
    )
    initializeDB();
})

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(keyList) {
                return Promise.all(keyList.map(function(key) {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('Removing old cache!', key)
                        return caches.delete(key)
                    }
                }));
            })
    )
    return self.clients.claim(); //-> ensures the service workers are activated correctly
})

function isInArray(string, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === string) {
            return true;
        }
    }
    return false;
}

self.addEventListener('fetch', function(event) {
    let url = 'https://pwagram-979a9-default-rtdb.europe-west1.firebasedatabase.app/posts';

    if(event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
            .then(async function(response) {
                let cloneRes = response.clone();
                try {
                    console.log('Clearing data...');
                    await clearAllData('posts');
                    console.log('Data cleared. Processing new data...');
                } catch (error) {
                    console.error('Error clearing data:', error);
                }

                // Process and store new data
                try {
                    const data = await cloneRes.json();
                    for (let key in data) {
                        try {
                            await writeData('posts', data[key])
                                // .then(function() {
                                //     deleteItemFromData('posts', key)
                                // })
                        } catch (error) {
                            console.error('Error storing data in IndexedDB:', error);
                        }
                    }
                } catch (error) {
                    console.error('Error processing new data:', error);
                }
                return response;
            })
        )
    //check if my url is part of this array files
    } else if (isInArray(event.request.url, STATIC_FILES)) {
        //cache only startegy for static files
        event.respondWith(caches.match(event.request))
    } else {
        event.respondWith(caches.match(event.request)
        .then(function(response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
                .then(function (res) {
                    return caches.open(CACHE_DYNAMIC_NAME)
                        .then(function(cache) {
                            cache.put(event.request.url, res.clone())
                            return res
                        })
                })
                .catch(function(error) {
                    return caches.open(CACHE_STATIC_NAME)
                        .then(function(cache) {
                            if (event.request.headers.get('accept').includes('text/html')) {
                                return cache.match('/offline.html')
                            }
                        })
                })
            }
        }))
    }
  });


//   self.addEventListener('fetch', function(event) {
//     event.respondWith(
//       caches.match(event.request)
//         .then(function(response) {
//           if (response) {
//             return response;
//           } else {
//             return fetch(event.request)
//                 .then(function (res) {
//                     return caches.open(CACHE_DYNAMIC_NAME)
//                         .then(function(cache) {
//                             cache.put(event.request.url, res.clone())
//                             return res
//                         })
//                 })
//                 .catch(function(error) {
//                     return caches.open(CACHE_STATIC_NAME)
//                         .then(function(cache) {
//                             return cache.match('/offline.html')
//                         })
//                 })
//           }
//         })
//     );
//   });



// network with cache fallback startegy
// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//       fetch(event.request)
//         .then(function(response) {
//             return caches.open(CACHE_DYNAMIC_NAME)
//                     .then(function(cache) {
//                         cache.put(event.request.url, response.clone())
//                             return res
//                     })
//         })
//         .catch(function(err) {
//            return caches.match(event.request) 
//         })
//     );
//   });