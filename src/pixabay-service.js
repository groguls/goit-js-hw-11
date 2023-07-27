import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38327915-34951327f1ceffc9b6b1fee95';

export default class PixabayService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.perPageParameter = 40;
  }

  async fetchImages() {
    const fetchOptions = {
      params: {
        key: API_KEY,
        q: this.searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: this.perPageParameter,
        page: this.page,
      },
    };

    const { data } = await axios(BASE_URL, fetchOptions);
    this.incrementPage();
    return data;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
