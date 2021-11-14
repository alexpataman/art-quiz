import { layout } from '../main';

export default class Test {
  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  modal() {
    layout.openModal('test');
  }

  async quiz(quizType) {
    await this.timeout(510);
    document
      .querySelector(`.game-options a[data-id="${quizType}"]`)
      .dispatchEvent(new Event('click'));
  }

  async question(quizType) {
    await this.quiz(quizType);

    await this.timeout(510);
    document
      .querySelector('.round-selector div[data-round-id="0"]')
      .dispatchEvent(new Event('click'));
  }
}
