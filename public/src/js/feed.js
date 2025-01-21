var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form')
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');


function initializeMedia() {
  //API that gives us access to camera and microphone
  if(!('mediaDevices' in navigator)) { 
    navigator.mediaDevices = {};
  }

  if(!('getUserMedia' in navigator.mediaDevices)) {
    //constraints will be video or audio
    navigator.mediaDevices.getUserMedia = function(constraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if(!getUserMedia) {
        return Promise.reject('getUserMedia is not implemented!')
      }

      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    } 
  }
  
  //this means give me access to video and audio
  navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(function(stream) {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(function(error) {
      imagePickerArea.style.display = 'block';
    })
}

captureButton.addEventListener('click', function(event) {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
});

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  setTimeout(function() {
    createPostArea.style.transform = 'translateY(0)';
    initializeMedia();
  }, 1)
 
  if (deferredPrompt) {
    deferredPrompt.prompt() // will now show the banner to the user at this moment

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);
      
      // user clicks cancel/close button
      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation!')
      } else {
        console.log('User added it to the homescreen.')
      }
    })
    deferredPrompt = null;
  }
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (let i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
  createPostArea.style.transform = 'translateY(100vh)';
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

//currently not in use, allows to save assets on user demand
// function onSaveButtonClicked(event) {
//   console.log('Clicked')

//   if('caches' in window) {
//     caches.open('user-requested')
//       .then(function(cache) {
//         cache.add('https://httpbin.org/get')
//         cache.add('/src/images/sf-boat.jpg')
//       })
//   }
// }

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function createCard(data) {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  sharedMomentsArea.style.display = 'flex';
  sharedMomentsArea.style.flexDirection = 'column';
  sharedMomentsArea.style.justifyContent = 'center';
  sharedMomentsArea.style.alignItems = 'center';
  sharedMomentsArea.style.gap = '15px';
  // let cardSaveButton = document.createElement('button');
  // cardSupportingText.appendChild(cardSaveButton);
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.style.marginLeft = '10px';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  

  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (let i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}



let url = 'https://pwagram-979a9-default-rtdb.europe-west1.firebasedatabase.app/posts.json'
let networkDataReceived = false;


if('indexedDB' in window) {
  readAllData('posts')
    .then(function(data) {
      console.log('INNN')
      if(!networkDataReceived) {
        console.log('From cache', data)
        updateUI(data);
      }
    })
}

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web data',data);

    let dataArray = [];
    for(let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray)
  })
  .catch(error => {
    console.log('Something is wrong with the fetch', error);
  });

function sendData() {
  fetch('https://pwagram-979a9-default-rtdb.europe-west1.firebasedatabase.app/posts.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: "https://media.timeout.com/images/106166440/1536/1152/image.webp"
    })
  })
  .then(function(res) {
    console.log('Send data from sendData function', res)
    updateUI();
  })
} 

form.addEventListener('submit', function(event) {
    event.preventDefault();

    if(titleInput.value.trim() === '' || locationInput.value.trim() === '') {
      alert('Please enter valid data!');
      return;
    }

    closeCreatePostModal();

    if('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then(function(sw) {
              console.log('0')
              let post = {
                id: new Date().toISOString(),
                title: titleInput.value,
                location: locationInput.value
              }
                writeData('sync-posts', post)
                console.log('1')
                  .then(function() {
                    return sw.sync.register('sync-new-post');
                  })
                  .then(function() {
                    console.log('2')
                    let snackBarContainer = document.querySelector('#confirmation-toast')
                    let data = {
                      message: 'Your post was saved for syncing!'
                    }
                    snackBarContainer.MaterialSnackbar.showSnackbar(data);
                  })
                  .catch(function(error) {
                    console.log('3')
                    console.log('Error from the sync posts process', error)
                  })
                
            })
    } else {
      sendData();
    }
})


