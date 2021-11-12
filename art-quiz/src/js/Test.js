export default class Test {
  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async question(quizType) {
    await this.timeout(10);
    document
      .querySelector(`.game-options a[data-id="${quizType}"]`)
      .dispatchEvent(new Event('click'));

    await this.timeout(10);
    document
      .querySelector('.round-selector div[data-round-id="0"]')
      .dispatchEvent(new Event('click'));
  }
}
