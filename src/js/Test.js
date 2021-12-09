import { timeout } from './utils';

export default class Test {
  constructor(layout) {
    this.layout = layout;
  }

  static async settings() {
    await timeout(510);
    document.querySelector(`.settings .icon`).dispatchEvent(new Event('click'));
  }

  static modal() {
    this.layout.openModal('test');
  }

  static async quiz(quizType) {
    await timeout(1000);
    document
      .querySelector(`.game-options a[data-id="${quizType}"]`)
      .dispatchEvent(new Event('click'));
  }

  static async question(quizType) {
    await Test.quiz(quizType);

    await timeout(510);
    document
      .querySelector('.round-selector div[data-round-id="0"]')
      .dispatchEvent(new Event('click'));
  }
}
