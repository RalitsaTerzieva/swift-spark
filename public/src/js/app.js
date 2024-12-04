let deferredPrompt;

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(function () {
        console.log('Service worker registered!')
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
    console.log('Before install prompt fired')
    event.preventDefault();
    deferredPrompt = event;
    return false
})