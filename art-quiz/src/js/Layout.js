import Modal from './Modal';

export default class Layout {
  constructor() {
    this.TRANSITION_TIMEOUT = 500;
    this.loadingItems = [];
    this.state = null;
    this.setSelectors();
    this.initModal();
  }

  initModal() {
    this.modal = new Modal(document.getElementById('modal'));
  }

  setState(state) {
    this.state = state;
  }

  startLoader() {
    this.main.classList.add('loading');
  }

  finishLoader() {
    this.main.classList.remove('loading');
  }

  addLoadingItem(item) {
    this.loadingItems.push(item);
  }

  removeLoadingItem(item) {
    this.loadingItems = this.loadingItems.filter((el) => el === item);
    if (this.loadingItems.length === 0) {
      setTimeout(() => this.finishLoader(), 1000);
    }
  }

  setSelectors() {
    this.body = document.querySelector('body');
    this.header = document.querySelector('body > header');
    this.main = document.querySelector('body > main');
    this.footer = document.querySelector('body > footer');
    this.backLinkWrapper = this.header.querySelector('.back-link-wrapper');
  }

  async setPageContent(content, pageId) {
    return new Promise((resolve) => {
      this.main.style.opacity = 0;
      setTimeout(() => {
        this.setState(pageId);
        this.setBodyClassName(pageId);
        this.main.replaceChildren(content);
        this.main.style.opacity = 1;
        document.dispatchEvent(new CustomEvent(`${pageId}Ready`));
        resolve(true);
      }, this.TRANSITION_TIMEOUT);
    });
  }

  setBodyClassName(className) {
    this.body.className = className;
  }

  async addBackLink(fn, context) {
    setTimeout(() => {
      this.backLink = Layout.getBackLink();
      this.backLinkWrapper.replaceChildren(this.backLink);
      this.backLink.addEventListener('click', () => {
        this.backLink.remove();
        fn.apply(context);
      });
    }, this.TRANSITION_TIMEOUT);
  }

  static getBackLink() {
    const el = document.createElement('a');
    el.className = 'arrow-left back';
    return el;
  }

  static fixBody() {
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.position = 'fixed';
  }

  static unfixBody() {
    document.body.style.position = '';
    document.body.style.top = '';
  }
}
