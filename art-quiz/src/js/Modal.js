export default class Modal {
  constructor(el) {
    this.isOpen = false;
    this.modalContainer = el;
    this.modalContent = this.modalContainer.querySelector('.modal-content');
    this.overlayElement = Modal.createOverlayElement();
    document.body.append(this.overlayElement);
  }

  async open(content = '') {
    this.modalContent.replaceChildren(content);
    this.modalContainer.classList.add('open');
    this.showOverlay();
    this.isOpen = true;
  }

  close() {
    this.modalContainer.classList.remove('open');
    this.removeOverlay();
    this.isOpen = false;
  }

  static createOverlayElement() {
    const el = document.createElement('div');
    el.className = 'modal-overlay';
    return el;
  }

  showOverlay() {
    this.overlayElement.classList.add('visible');
    // document.body.insertAdjacentHTML(
    //   'beforeend',
    //   '<div class="modal-overlay"></div>',
    // );
  }

  removeOverlay() {
    this.overlayElement.classList.remove('visible');
    // document.body.querySelectorAll('.modal-overlay').forEach(element => {
    //   element.remove()
    // });
  }
}
