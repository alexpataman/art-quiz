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
  }

  setPageContent(content, className = '') {
    this.main.replaceChildren(content);
    this.setBodyClassName(className);
  }

  setBodyClassName(className) {
    this.body.className = className;
  }

  setHandlers() {}
}
