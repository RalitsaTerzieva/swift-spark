let deferredPrompt;
let enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
    .then(function () {
        console.log('Service worker registered!')
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
    event.preventDefault();
    deferredPrompt = event;
    return false
})

function displayConfirmNotification() {
    let options = {
        body: 'You successfully subcribe for our Notification service!'
    };
    new Notification('Successfully subcribed!', options)
}

function askForNotificationPermission() {
    Notification.requestPermission(function(result) {
        console.log('User permission choice', result);

        if(result !== 'granted') {
            console.log('No notification permission granted!')
        } else {
            displayConfirmNotification();
        }
    })
}

if ('Notification' in window) {
    for (let i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission)
    }
}