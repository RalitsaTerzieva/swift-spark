self.addEventListener('install', function(event) {
    console.log('Installing Service worker...', event)
})

self.addEventListener('activate', function(event) {
    console.log('Activating Service worker...', event)
    return self.clients.claim(); //-> ensures the service workers are activated correctly
})