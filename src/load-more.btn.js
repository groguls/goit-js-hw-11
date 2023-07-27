export default class LoadMoreBtn {
  constructor(selector) {
    this.refs = this.getRefs(selector);
  }

  getRefs(selector) {
    const refs = {};
    refs.button = document.querySelector(selector);
    refs.label = refs.button.querySelector('.label');
    refs.loader = refs.button.querySelector('.loader');
    return refs;
  }

  enable() {
    this.refs.button.disabled = false;
    this.refs.label.classList.remove('is-hidden');
    this.refs.loader.classList.add('is-hidden');
  }

  disable() {
    this.refs.button.disabled = true;
    this.refs.label.classList.add('is-hidden');
    this.refs.loader.classList.remove('is-hidden');
  }

  show() {
    this.refs.button.classList.remove('is-hidden');
  }

  hide() {
    this.refs.button.classList.add('is-hidden');
  }
}
