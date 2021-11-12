export default class Layout {
  constructor() {
    this.setSelectors();
    this.setHandlers();
  }

  setSelectors() {
    this.body = document.querySelector('body');
    this.header = document.querySelector('body > header');
    this.main = document.querySelector('body > main');
    this.footer = document.querySelector('body > footer');
    this.backLinkWrapper = this.header.querySelector('.back-link-wrapper');
  }

  setPageContent(content, className = '') {
    this.main.replaceChildren(content);
    this.setBodyClassName(className);
  }

  setBodyClassName(className) {
    this.body.className = className;
  }

  async addBackLink(fn, context) {
    this.backLink = this.getBackLink();
    this.backLinkWrapper.replaceChildren(this.backLink);

    this.backLink.addEventListener('click', () => {
      this.backLink.remove();
      fn.apply(context);
    });
  }

  getBackLink() {
    const el = document.createElement('a');
    el.className = 'arrow-left back';
    return el;
  }

  setHandlers() {}
}
