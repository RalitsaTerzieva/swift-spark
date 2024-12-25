var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');


function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
  cardTitle.style.height = '180px';
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





