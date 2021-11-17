import Modal from './Modal';

class Layout {
  constructor() {
    this.TRANSITION_TIMEOUT = 500;
    this.setSelectors();
    this.initModal();
    this.customEvents = {};
  }

  getCustomEvent(eventName) {
    if (!this.customEvents[eventName]) {
      this.customEvents[eventName] = new Event(eventName);
    }
    return this.customEvents[eventName];
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
