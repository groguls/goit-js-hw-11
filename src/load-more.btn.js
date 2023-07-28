export default class LoadMoreBtn {
  constructor(selector) {
    this.button = document.querySelector(selector);
  }

  show() {
    this.button.classList.remove('is-hidden');
  }

  hide() {
    this.button.classList.add('is-hidden');
  }
}
