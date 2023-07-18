import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38327915-34951327f1ceffc9b6b1fee95';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  moreButton: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onSearchSubmit);

function onSearchSubmit(evt) {
  evt.preventDefault();
  const searchQuery = evt.currentTarget.elements.searchQuery.value;
  fetchImages(searchQuery)
    .then(resp => {
      Notify.success(`Hooray! We found ${resp.data.totalHits} images.`);
      console.log(resp.data.hits);
      refs.gallery.insertAdjacentHTML(
        'beforeend',
        createGalleryItemsMarkup(resp.data.hits)
      );
    })
    .catch(onError);
}

async function fetchImages(query) {
  const fetchOptions = {
    params: {
      q: query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: 40,
      page: 1,
    },
    validateStatus: function (status) {
      return status >= 200 && status < 300;
    },
  };
  const response = await axios(`${BASE_URL}?key=${API_KEY}`, fetchOptions);
  console.log(response);
  return response;
}

function createGalleryItemsMarkup(galleryArr) {
  return galleryArr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <a href="${largeImageURL}">
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item">
              <b>Likes</b>
              ${likes}
            </p>
            <p class="info-item">
              <b>Views</b>
              ${views}
            </p>
            <p class="info-item">
              <b>Comments</b>
              ${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>
              ${downloads}
            </p>
          </div>
        </div>
        </a>`
    )
    .join('');
}

new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function onError(error) {
  Notify.failure('Oops! Something went wrong! Try reloading the page!', {
    clickToClose: true,
  });
  console.log('Error message: ', error);
}

// axios
//   .get(`https://pixabay.com/api/?key=${API_KEY}&q=nature&per_page=5`)
//   .then(function (response) {
//     const data = response.data.hits;
//     data.forEach(function (item) {
//       console.log(item.previewURL);
//     });
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

// const URL =
//   'https://pixabay.com/api/?key=' +
//   API_KEY +
//   '&q=' +
//   encodeURIComponent('red roses');
// $.getJSON(URL, function (data) {
//   if (parseInt(data.totalHits) > 0)
//     $.each(data.hits, function (i, hit) {
//       console.log(hit.pageURL);
//     });
//   else console.log('No hits');
// });
