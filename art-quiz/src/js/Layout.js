import Modal from './Modal';
import { game } from '../main';
export default class Layout {
  TRANSITION_TIMEOUT = 500;

  constructor() {
    this.setSelectors();
    this.setHandlers();
    this.initModal();
  }

  initModal() {
    this.modal = new Modal(document.getElementById('modal'));
  }

  setSelectors() {
    this.body = document.querySelector('body');
    this.header = document.querySelector('body > header');
    this.main = document.querySelector('body > main');
    this.footer = document.querySelector('body > footer');
    this.backLinkWrapper = this.header.querySelector('.back-link-wrapper');
  }

  setPageContent(content, className = '') {
    this.main.style.opacity = 0;
    setTimeout(() => {
      this.setBodyClassName(className);
      this.main.replaceChildren(content);
      this.main.style.opacity = 1;
    }, this.TRANSITION_TIMEOUT);
  }

  setBodyClassName(className) {
    this.body.className = className;
  }

  async addBackLink(fn, context) {
    setTimeout(() => {
      this.backLink = this.getBackLink();
      this.backLinkWrapper.replaceChildren(this.backLink);
      this.backLink.addEventListener('click', () => {
        this.backLink.remove();
        fn.apply(context);
      });
    }, this.TRANSITION_TIMEOUT);
  }

  getBackLink() {
    const el = document.createElement('a');
    el.className = 'arrow-left back';
    return el;
  }

  setHandlers() {
    this.header
      .querySelector('.logo')
      .addEventListener('click', () => game.showHomePage());
  }
}
