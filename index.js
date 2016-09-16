const userMap = new Map();
const albumMap = new Map();
const photoMap = new Map();

const $userList = document.querySelector('#user-list');
const $albumList = document.querySelector('#album-list');
const $photoList = document.querySelector('#photo-list');


function selectUser(userId) {
  userMap.get(userId).getAlbums().then(albums => {
    albums.forEach(album => albumMap.set(album.id, album));

    $albumList.innerHTML = albums
      .map(album => `<li><a href="#" data-album-id="${album.id}">${album.title}</a></li>`)
      .join('');
  });
}

function selectAlbum(albumId) {
  albumMap.get(albumId).getPhotos().then(photos => {
    photos.forEach(photo => photoMap.set(photo.id, photo));

    $photoList.innerHTML = photos
      .map(photo => `<li><a href="${photo.url}" target="_blank" data-photo-id="${photo.id}">
                       <img src="${photo.thumbnailUrl}">
                     </a></li>`)
      .join('');
  });
}


$userList.addEventListener('click', event => {
  event.preventDefault();

  const userId = event.target.dataset.userId;
  if (userId) selectUser(Number(userId));
});

$albumList.addEventListener('click', event => {
  event.preventDefault();

  const albumId = event.target.dataset.albumId;
  if (albumId) selectAlbum(Number(albumId));
});


User.list().then(users => {
  users.forEach(user => userMap.set(user.id, user));

  $userList.innerHTML = users
    .map(user => `<li><a href="#" data-user-id="${user.id}">${user.name}</a></li>`)
    .join('');
});
