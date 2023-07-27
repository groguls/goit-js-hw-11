import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import PixabayService from './pixabay-service';
import LoadMoreBtn from './load-more.btn';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  moreButton: document.querySelector('.load-more'),
};
const pixabayService = new PixabayService();
const loadMoreButton = new LoadMoreBtn('.load-more');
const simplelightbox = new SimpleLightbox('.gallery a');

refs.form.addEventListener('submit', onSearchSubmit);
loadMoreButton.refs.button.addEventListener('click', onMoreButtonClick);

async function onSearchSubmit(evt) {
  evt.preventDefault();

  loadMoreButton.hide();
  pixabayService.query = evt.currentTarget.elements.searchQuery.value;

  if (pixabayService.query === '') {
    Notify.warning('Please check your search query');
    return;
  }

  pixabayService.resetPage();
  clearGallery();

  try {
    const images = await pixabayService.fetchImages();

    if (images.data.totalHits <= 0) {
      Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    Notify.success(`Hooray! We found ${images.data.totalHits} images.`);
    loadMoreButton.show();
    paintGallery(images.data.hits);
    simplelightbox.refresh();
  } catch (error) {
    onError(error);
  }

  evt.target.reset();
}

async function onMoreButtonClick() {
  if (pixabayService.page > 13) {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );

    return;
  }

  try {
    const images = await pixabayService.fetchImages();
    paintGallery(images.data.hits);
    simplelightbox.refresh();
  } catch (error) {
    onError(error);
  }
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
      <div class="photo-card">
        <a href="${largeImageURL}">
       
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        
        <div class="info">
            <p class="info-item">
              <b>Likes:</b>
              ${likes}
            </p>
            <p class="info-item">
              <b>Views:</b>
              ${views}
            </p>
            <p class="info-item">
              <b>Comments:</b>
              ${comments}
            </p>
            <p class="info-item">
              <b>Downloads:</b>
              ${downloads}
            </p>
        </div>
        </a>  
          
      </div>`
    )
    .join('');
}

function paintGallery(markup) {
  refs.gallery.insertAdjacentHTML(
    'beforeend',
    createGalleryItemsMarkup(markup)
  );
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

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
