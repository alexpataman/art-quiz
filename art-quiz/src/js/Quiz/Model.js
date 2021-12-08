export default class Model {
  QUIZ_TYPES = [
    { id: 'artist', title: 'Artist Quiz' },
    { id: 'pictures', title: 'Pictures Quiz' },
  ];

  QUIZ_CATEGORIES = {
    en: [
      'Portrait',
      'Landscape',
      'Still Life',
      'Pop-Art',
      'Сubism',
      'Avant-garde',
      'Realism',
      'Interior',
      'Kitsch',
      'Minimalism',
      'Surrealism',
      'Renaissance',
    ],
    ru: [
      'Портрет',
      'Пейзаж',
      'Натюрморт',
      'Поп-арт',
      'Кубизм',
      'Авангард',
      'Реализм',
      'Интерьер',
      'Китч',
      'Минимализм',
      'Сюрреализм',
      'Ренессанс',
    ],
  };

  constructor(controller) {
    this.main = controller;
  }

  setupGameData() {
    this.main.data = {
      settings: {},
      quizzes: {},
    };

    this.setupQuestions();
    this.saveGameData();
  }

  loadGameData() {
    this.main.data = this.main.app.storage.exists('gameData')
      ? this.main.app.storage.get('gameData')
      : null;
  }

  saveGameData() {
    this.main.app.storage.set('gameData', this.main.data);
  }

  async fetchDb() {
    const request = await fetch(`${this.main.SETTINGS.dbPath}/data.json`);
    this.db = await request.json();
  }

  /**
   * Setup questions structure for every game type.
   * Setup shuffled round images.
   */
  setupQuestions() {
    let questions = [...this.db[this.main.settings.data.language]];
    if (this.main.SETTINGS.initRandomSort) {
      questions = questions.sort(() => 0.5 - Math.random());
    }

    let i = 0;

    this.QUIZ_TYPES.forEach((quizType) => {
      this.main.data.quizzes[quizType.id] = {
        rounds: [],
      };

      for (let r = 0; r < this.main.SETTINGS.numberOfRounds; r += 1) {
        const roundData = {
          questions: [],
          imageNum: null,
        };
        for (let q = 0; q < this.main.SETTINGS.questionsPerRound; q += 1) {
          roundData.questions.push({
            data: { index: i, imageNum: questions[i].imageNum },
            status: null,
          });
          i += 1;
        }
        roundData.imageNum =
          roundData.questions[
            Math.floor(Math.random() * this.main.SETTINGS.questionsPerRound)
          ].data.imageNum;

        this.main.data.quizzes[quizType.id].rounds.push(roundData);
      }
    });
  }
}
