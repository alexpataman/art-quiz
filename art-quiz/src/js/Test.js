import { layout } from '../main';
import { timeout } from './utils';

export default class Test {
  modal() {
    layout.openModal('test');
  }

  async quiz(quizType) {
    await timeout(510);
    document
      .querySelector(`.game-options a[data-id="${quizType}"]`)
      .dispatchEvent(new Event('click'));
  }

  async question(quizType) {
    await this.quiz(quizType);

    await timeout(510);
    document
      .querySelector('.round-selector div[data-round-id="0"]')
      .dispatchEvent(new Event('click'));
  }
}
