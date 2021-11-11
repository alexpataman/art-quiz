import { layout } from '../main';
import data from '../data/images';

export default class Game {
  QUIZ_TYPES = [
    { id: 'artist', title: 'Artist Quiz' },
    { id: 'pictures', title: 'Pictures Quiz' },
  ];

  SETTINGS = {
    questionsPerRound: 10,
    numberOfRounds: 6,
    imagePath:
      'https://raw.githubusercontent.com/alexpataman/image-data/master/img/{{imageID}}.jpg',
  };

  constructor() {
    this.prepareGameData();
    this.showHomePage();
    console.log(this.data);
  }

  showHomePage() {
    let html = document.createElement('section');
    html.className = 'game-options';

    this.QUIZ_TYPES.forEach((el) => {
      const optionWrapper = document.createElement('div');
      const option = document.createElement('a');
      option.href = '#';
      option.dataset['id'] = el.id;
      option.className = el.id;
      option.textContent = el.title;
      option.addEventListener('click', (event) => this.startGame(event));
      optionWrapper.append(option);
      html.append(optionWrapper);
    });

    layout.setPageContent(html, 'home');
  }

  showRoundSelectorPage() {
    layout.setPageContent(this.getRoundSelectorContent(), 'round-selector');
  }

  showQuestionPage(roundIndex, questionIndex) {
    const question =
      this.data.quizzes[this.gameType].rounds[roundIndex].questions[
        questionIndex
      ];
    layout.setPageContent(this.getQuestionContent(question), 'question');
  }

  getRoundSelectorContent() {
    let html = document.createElement('section');
    for (let i = 0; i < this.SETTINGS.numberOfRounds; i++) {
      const option = document.createElement('div');
      option.dataset['roundId'] = i;
      option.addEventListener('click', (event) => this.startRound(event));
      option.innerHTML = `
        <h3>Round #${i + 1} [0/10]</h3>
        <img src="${this.getRoundImageUrl(i)}" alr="">
      `;
      html.append(option);
    }

    return html;
  }

  getQuestionContent(question) {
    let html = document.createElement('section');
    //console.log(question);
    html.innerHTML = JSON.stringify(question, null, 2);
    return html;
  }

  getRoundImageUrl(roundId) {
    return this.SETTINGS.imagePath.replace(
      '{{imageID}}',
      this.data.quizzes[this.gameType].rounds[roundId].imageID
    );
  }

  setupGameData() {
    this.data = {
      settings: {},
      quizzes: {},
    };

    this.QUIZ_TYPES.forEach((quizType) => {
      this.data.quizzes[quizType.id] = {
        rounds: [],
      };
      this.setupQuestions(quizType.id);
    });

    this.saveGameData();
  }

  setupQuestions(quizType) {
    if (
      data.length <=
      this.SETTINGS.numberOfRounds * this.SETTINGS.questionsPerRound
    ) {
      throw new Error(
        'Wrong game settings. Number of questions in the database is too low.'
      );
    }

    const questions = [...data]
      .sort((a, b) => 0.5 - Math.random())
      .slice(0, this.SETTINGS.numberOfRounds * this.SETTINGS.questionsPerRound);

    let i = 0;
    for (let r = 0; r < this.SETTINGS.numberOfRounds; r++) {
      const roundData = {
        questions: [],
        imageID: null,
      };
      for (let q = 0; q < this.SETTINGS.questionsPerRound; q++) {
        roundData.questions.push({
          correctAnswer: questions[i],
          userAnswer: null,
          isCorrectAnswer: false,
        });
        i++;
      }
      roundData.imageID =
        roundData.questions[
          Math.floor(Math.random() * this.SETTINGS.questionsPerRound)
        ].correctAnswer.imageNum;
      this.data.quizzes[quizType].rounds.push(roundData);
    }
  }

  prepareGameData() {
    if (localStorage._gameData) {
      this.data = JSON.parse(localStorage._gameData);
    } else {
      this.setupGameData();
    }
  }

  saveGameData() {
    localStorage._gameData = JSON.stringify(this.data);
  }

  startGame(event) {
    this.gameType = event.target.dataset['id'];
    this.showRoundSelectorPage();
  }

  startRound(event) {
    this.showQuestionPage(event.currentTarget.dataset['roundId'], 0);
  }
}
