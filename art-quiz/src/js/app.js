import Storage from './Storage';
import Layout from './Layout';
import Sounds from './Sounds';
import Translations from './Translations';
import Settings from './Settings';
import Quiz from './Quiz';

class App {
  constructor() {
    this.storage = new Storage();
    this.layout = new Layout();
    this.sounds = new Sounds();
    this.translations = new Translations();
    this.settings = new Settings(this);
    this.quiz = new Quiz(this);
  }

  run() {
    this.settings.init();
    this.quiz.init();
  }
}

export default new App();
