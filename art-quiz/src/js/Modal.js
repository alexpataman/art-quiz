export default class Modal {
  constructor(el) {
    this.isOpen = false;
    this.modalContainer = el;
    this.modalContent = this.modalContainer.querySelector('.modal-content');
  }

  async open(content = '') {
    this.modalContent.replaceChildren(content);
    this.modalContainer.classList.add('open');
    this.addOverlay();
    this.isOpen = true;
  }

  close() {
    this.modalContainer.classList.remove('open');
    this.removeOverlay();
    this.isOpen = false;
  }

  addOverlay() {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="modal-overlay" style="z-index: 1002; display: block; opacity: 0.5;"></div>`
    );
  }

  removeOverlay() {
    const overlay = document.body.querySelector('.modal-overlay');
    if (overlay) {
      overlay.remove();
    } else {
      console.log('Error: Overlay not found');
    }
  }
}
