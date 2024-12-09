const CACHE_STATIC_NAME = 'static-v15';
const CACHE_DYNAMIC_NAME = 'dynamic-v7'

this.addEventListener('install', function(event) {
    console.log('Installing Service worker...', event)
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache) {
                console.log('Precaching App Shell')
                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                  ])
            })
            .catch(function(error) {
                console.error('Precaching failed:', error);
            })
    ) 
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

self.addEventListener('fetch', function(event) {
    let url = 'https://httpbin.org/get'
    if(event.request.url.indexOf(url) > -1) {
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
              .then(function(cache) {
                  return fetch(event.request)
                      .then(function(response) {
                          cache.put(event.request, response.clone());
                          return response;
                      })
              })
          );
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
                            return cache.match('/offline.html')
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