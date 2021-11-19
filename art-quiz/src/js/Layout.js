import Modal from './Modal';

class Layout {
  constructor() {
    this.TRANSITION_TIMEOUT = 500;
    this.setSelectors();
    this.initModal();
    this.loadingItems = [];
  }

  initModal() {
    this.modal = new Modal(document.getElementById('modal'));
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
}

export default new Layout();
