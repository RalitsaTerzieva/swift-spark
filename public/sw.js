self.addEventListener('install', function(event) {
    console.log('Installing Service worker...', event)
    event.waitUntil(
        caches.open('static')
            .then(function(cache) {
                console.log('Precaching App Shell')
                cache.add('/src/js/app.js')
            })
    ) 
})

self.addEventListener('activate', function(event) {
    return self.clients.claim(); //-> ensures the service workers are activated correctly
})

self.addEventListener('fetch', function(event) {
    event.respondWith(fetch(event.request)) // Override the data that was sent back
})