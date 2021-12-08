import i18next from 'i18next';
import config from '../config';
import View from './View';
import Model from './Model';
import Timer from '../Timer';

export default class Quiz {
  SETTINGS = {
    questionsPerRound: config.debug ? 2 : 10,
    numberOfRounds: config.debug ? 6 : 12,
    numberOfAnswerOptions: 4,
    delayAfterAnswer: 500,
    initRandomSort: false,
    dbPath: 'https://raw.githubusercontent.com/alexpataman/art-quiz-data/main',
  };

  constructor(app) {
    this.app = app;
    this.view = new View(this);
    this.model = new Model(this);
    this.settings = this.app.settings;
    this.variables = {
      gameType: null,
      currentRoundId: null,
      currentQuestionId: null,
      currentQuestion: null,
      currentAnswerOptions: null,
      timer: new Timer(this),
    };
  }

  async init() {
    await this.model.fetchDb();
    this.prepareGameData();
    this.showHomePage();
    this.setHandlers();
    this.prepareSounds();
  }

  prepareGameData() {
    this.model.loadGameData();
    if (!this.data) {
      this.model.setupGameData();
    }
    this.preloadNecessaryImages();
  }

  showHomePage() {
    const html = document.createElement('section');
    html.className = 'game-options';

    this.model.QUIZ_TYPES.forEach((el) => {
      const optionWrapper = document.createElement('div');
      const option = document.createElement('a');
      option.href = '#';
      option.dataset.id = el.id;
      option.className = el.id;
      option.textContent = i18next.t(el.title);
      option.addEventListener('click', (event) => this.startGame(event), { once: true });
      optionWrapper.append(option);
      html.append(optionWrapper);
    });

    this.app.layout.setPageContent(html, 'home');
  }

  showRoundSelectorPage() {
    this.model.loadGameData();
    this.app.layout.setPageContent(this.view.getRoundSelectorPageContent(), 'round-selector');
    this.app.layout.addBackLink(this.showHomePage, this);
  }

  showRoundStatisticsPage(roundId) {
    this.app.layout.setPageContent(
      this.view.getRoundStatisticsPageContent(roundId),
      'round-statistics',
    );
    this.app.layout.addBackLink(this.showRoundSelectorPage, this);
  }

  async startQuestion(roundIndex, questionIndex = 0) {
    this.variables.currentQuestionId = questionIndex;
    this.variables.currentQuestion = this.getQuestion(roundIndex, questionIndex);
    this.variables.currentAnswerOptions = Quiz.shuffleOptions(
      this.variables.currentQuestion.data,
      this.getWrongOptions(),
    );

    await this.app.layout.setPageContent(this.view.getQuestionPageContent(), 'question');
    this.app.layout.addBackLink(this.view.showRoundSelectorPage, this);
    this.preloadNextQuestionImages();
    this.variables.timer.init();
  }

  getQuestion(roundIndex, questionIndex) {
    return {
      data: this.model.db[this.settings.data.language][
        this.data.quizzes[this.variables.gameType].rounds[roundIndex].questions[questionIndex].data
          .index
      ],
    };
  }

  static shuffleOptions(correctAnswer, wrongOptions) {
    return wrongOptions.concat(correctAnswer).sort(() => 0.5 - Math.random());
  }

  /**
   *  Getting wrong answer options
   * - exclude correct answer
   * - keep unique author names only
   * - shuffle
   */
  getWrongOptions() {
    return this.model.db[this.settings.data.language]
      .filter((el) => {
        const isCurrentQuestion =
          JSON.stringify(el) === JSON.stringify(this.variables.currentQuestion.data);

        return !isCurrentQuestion;
      })
      .reduce((acc, item) => {
        const isCurrentAuthor =
          this.variables.currentQuestion.data.author.toLocaleLowerCase() ===
          item.author.toLocaleLowerCase();

        const notInOptionsSet = (arr, x) =>
          arr.every((el) => x.author.toLocaleLowerCase() !== el.author.toLocaleLowerCase());

        if (!isCurrentAuthor && notInOptionsSet(acc, item)) {
          acc.push(item);
        }

        return acc;
      }, [])
      .sort(() => 0.5 - Math.random())
      .slice(0, this.SETTINGS.numberOfAnswerOptions - 1);
  }

  resetRoundProgress(roundId) {
    for (let i = 0; i < this.SETTINGS.questionsPerRound; i += 1) {
      this.data.quizzes[this.variables.gameType].rounds[roundId].questions[i].status = null;
    }
  }

  getRoundStatistics(roundId) {
    return this.data.quizzes[this.variables.gameType].rounds[roundId].questions.reduce(
      (acc, el) => {
        acc.total += 1;
        if (el.status === true) {
          acc.correct += 1;
        } else if (el.status === false) {
          acc.wrong += 1;
        }
        return acc;
      },
      {
        correct: 0,
        wrong: 0,
        total: 0,
      },
    );
  }

  processAnswer(userAnswerId) {
    let isCorrectAnswer;
    this.variables.timer.stop();
    if (userAnswerId >= 0) {
      isCorrectAnswer = this.isCorrectAnswer(userAnswerId);
    } else {
      isCorrectAnswer = false;
    }

    if (isCorrectAnswer) {
      this.playEffect('answerCorrect');
    } else {
      this.playEffect('answerWrong');
    }
    this.highlightAnswers(userAnswerId);
    this.setUserAnswer(isCorrectAnswer);
    setTimeout(() => {
      this.app.layout.modal.open(
        this.view.getQuestionAnswerModalContent(
          this.variables.currentQuestion,
          isCorrectAnswer,
          true,
        ),
      );
    }, this.SETTINGS.delayAfterAnswer);
  }

  highlightAnswers(userAnswerId) {
    this.app.layout.main.querySelectorAll('.answer-options > *').forEach((el, index) => {
      if (index === +userAnswerId) {
        if (
          el.textContent === this.variables.currentQuestion.data.author ||
          el.title === this.variables.currentQuestion.data.name
        ) {
          el.classList.add('correct');
        } else {
          el.classList.add('wrong');
        }
      }
    });
  }

  nextQuestion() {
    this.variables.timer.destroy();
    if (this.variables.currentQuestionId < this.SETTINGS.questionsPerRound - 1) {
      this.variables.currentQuestionId += 1;
      this.startQuestion(this.variables.currentRoundId, this.variables.currentQuestionId);
    } else {
      this.saveGameData();
      setTimeout(() => {
        this.playEffect('roundEnd');
        this.app.layout.modal.open(this.view.getQuestionFinalModalContent());
      }, this.SETTINGS.delayAfterAnswer);
    }
  }

  nextRound() {
    this.variables.currentRoundId += 1;
    this.variables.currentQuestionId = 0;
    this.startQuestion(this.variables.currentRoundId, this.variables.currentQuestionId);
  }

  setUserAnswer(value) {
    this.data.quizzes[this.variables.gameType].rounds[this.variables.currentRoundId].questions[
      this.variables.currentQuestionId
    ].status = value;
  }

  isCorrectAnswer(id) {
    const answerOption = this.variables.currentAnswerOptions[id];
    return JSON.stringify(answerOption) === JSON.stringify(this.variables.currentQuestion.data);
  }

  getQuestionImageUrl(imageNum) {
    return `${this.SETTINGS.dbPath}/images/small/${imageNum}.jpg`;
  }

  getQuestionImageFullUrl(imageNum) {
    return `${this.SETTINGS.dbPath}/images/full/${imageNum}full.jpg`;
  }

  getRoundImageUrl(roundId) {
    return `${this.SETTINGS.dbPath}/images/small/${
      this.data.quizzes[this.variables.gameType].rounds[roundId].imageNum
    }.jpg`;
  }

  /**
   * Preload round images
   * Preload first question images
   */
  preloadNecessaryImages() {
    this.model.QUIZ_TYPES.forEach((type) => {
      this.data.quizzes[type.id].rounds.forEach((el) => {
        this.preloadImage(this.getQuestionImageUrl(el.imageNum));
        this.preloadImage(this.getQuestionImageUrl(el.questions[0].data.imageNum));
      });
    });
  }

  preloadNextQuestionImages() {
    if (this.variables.currentQuestionId < this.SETTINGS.questionsPerRound - 1) {
      const nextQuestion = this.getQuestion(
        this.variables.currentRoundId,
        this.variables.currentQuestionId + 1,
      );
      this.preloadImage(this.getQuestionImageUrl(nextQuestion.data.imageNum));
    }
  }

  // eslint-disable-next-line class-methods-use-this
  preloadImage(url, callback) {
    const img = new Image();
    img.src = url;
    img.onload = callback;
  }

  startGame(event) {
    this.variables.gameType = event.target.dataset.id;
    this.showRoundSelectorPage();
    this.playMusic();
  }

  prepareSounds() {
    this.app.sounds.setVolume('music', this.settings.data.musicVolumeLevel);
    this.app.sounds.setVolume('effects', this.settings.data.musicVolumeLevel);
  }

  playMusic() {
    if (this.settings.data.enableMusic) {
      this.app.sounds.playMusic();
    }
  }

  playEffect(key) {
    if (this.settings.data.enableSoundEffects) {
      this.app.sounds.playEffect(key);
    }
  }

  startRound(roundId) {
    this.variables.currentRoundId = roundId;
    this.resetRoundProgress(this.variables.currentRoundId);
    this.startQuestion(this.variables.currentRoundId);
  }

  setHandlers() {
    this.app.layout.header
      .querySelector('.logo')
      .addEventListener('click', () => this.showHomePage());
    document.addEventListener('changeLanguage', () => this.showHomePage());
  }
}
