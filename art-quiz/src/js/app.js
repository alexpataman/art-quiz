import Settings from './Settings';
import Game from './Game';
// import Test from './js/Test';

class App {
  constructor() {
    this.settings = new Settings();
    this.game = new Game(this.settings);
  }

  run() {
    this.settings.init();
    this.game.init();
  }
}

export default new App();

// Test.settings();
// Test.question('artist');
// Test.question('pictures');
// Test.quiz('artist');
// Test.modal();
