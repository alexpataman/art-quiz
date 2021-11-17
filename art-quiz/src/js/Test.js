import layout from './layout';
import { timeout } from './utils';

export default class Test {
  static async settings() {
    await timeout(510);
    document.querySelector(`.settings .icon`).dispatchEvent(new Event('click'));
  }

  static modal() {
    layout.openModal('test');
  }

  static async quiz(quizType) {
    await timeout(510);
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
