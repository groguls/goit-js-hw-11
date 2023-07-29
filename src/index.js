import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import PixabayService from './pixabay-service';
import LoadMoreBtn from './load-more.btn';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};
const moreButton = new LoadMoreBtn('.load-more');
const infinityButton = new LoadMoreBtn('.load-more-infinity');
const pixabayService = new PixabayService();
const simplelightbox = new SimpleLightbox('.gallery a');

const observer = new IntersectionObserver(onIntersect, {
  root: null,
  rootMargin: '500px',
  threshold: 0,
});

refs.form.addEventListener('submit', onSearchSubmit);
moreButton.button.addEventListener('click', fetchPictures);
infinityButton.button.addEventListener('click', onInfinityButtonClick);

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

async function fetchPictures() {
  moreButton.hide();
  infinityButton.hide();
  try {
    Loading.pulse();
    const page = pixabayService.page;
    const images = await pixabayService.fetchImages();
    const totalImgs = images.totalHits;

    if (totalImgs <= 0) {
      Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      Loading.remove();
      return;
    }

    if (totalImgs > pixabayService.perPageParameter) {
      moreButton.show();
      infinityButton.show();
    }

    paintGallery(images.hits);
    simplelightbox.refresh();
    Loading.remove();

    if (page === 1) {
      Notify.success(`Hooray! We found ${totalImgs} images.`);
    } else {
      smoothScrolling();
    }

    if (
      pixabayService.page >
      Math.ceil(totalImgs / pixabayService.perPageParameter)
    ) {
      Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
      moreButton.hide();
      infinityButton.hide();
      observer.unobserve(refs.guard);
      return;
    }
  } catch (error) {
    onError(error);
  }
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
        <a class="thumb" href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
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
  Loading.remove();
  console.log('Error message: ', error);
}

function onIntersect(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fetchPictures();
    }
  });
}

function onInfinityButtonClick() {
  observer.observe(refs.guard);
}
