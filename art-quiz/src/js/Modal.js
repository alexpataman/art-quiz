export default class Modal {
  constructor(el) {
    this.isOpen = false;
    this.modalContainer = el;
    this.modalContent = this.modalContainer.querySelector('.modal-content');
    this.overlayElement = Modal.createOverlayElement();
    document.body.append(this.overlayElement);
  }

  open(content = '') {
    document.body.classList.add('modal-open');
    this.modalContent.replaceChildren(content);
    this.modalContainer.classList.add('open');
    this.showOverlay();
    this.isOpen = true;
    Modal.fixBody();
  }

  close() {
    document.body.classList.remove('modal-open');
    this.modalContainer.classList.remove('open');
    this.removeOverlay();
    this.isOpen = false;
    Modal.unfixBody();
  }

  static createOverlayElement() {
    const el = document.createElement('div');
    el.className = 'modal-overlay';
    return el;
  }

  showOverlay() {
    this.overlayElement.classList.add('visible');
  }

  removeOverlay() {
    this.overlayElement.classList.remove('visible');
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
