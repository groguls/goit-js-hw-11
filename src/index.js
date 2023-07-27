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

let totalImgs = null;

refs.form.addEventListener('submit', onSearchSubmit);
loadMoreButton.refs.button.addEventListener('click', onMoreButtonClick);

function onSearchSubmit(evt) {
  evt.preventDefault();

  pixabayService.query = evt.currentTarget.elements.searchQuery.value;

  if (pixabayService.query === '') {
    Notify.warning('Please check your search query');
    return;
  }

  pixabayService.resetPage();
  clearGallery();
  fetchPictures();
  evt.target.reset();
}

function onMoreButtonClick() {
  if (
    pixabayService.page > Math.ceil(totalImgs / pixabayService.perPageParameter)
  ) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
    loadMoreButton.hide();
    return;
  }
  fetchPictures();
}

async function fetchPictures() {
  loadMoreButton.hide();
  try {
    Loading.pulse();
    const page = pixabayService.page;
    const images = await pixabayService.fetchImages();
    totalImgs = images.totalHits;

    if (totalImgs <= 0) {
      Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (totalImgs > pixabayService.perPageParameter) {
      loadMoreButton.show();
    }

    paintGallery(images.hits);
    simplelightbox.refresh();
    Loading.remove();

    if (page === 1) {
      Notify.success(`Hooray! We found ${totalImgs} images.`);
    } else {
      smoothScrolling();
    }
  } catch (error) {
    onError(error);
  }
  Loading.remove();
}

function smoothScrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
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
