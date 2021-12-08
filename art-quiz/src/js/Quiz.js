import i18next from 'i18next';
import config from './config';
import Timer from './Timer';
import * as utils from './utils';

export default class Quiz {
  static QUIZ_TYPES = [
    { id: 'artist', title: 'Artist Quiz' },
    { id: 'pictures', title: 'Pictures Quiz' },
  ];

  static QUIZ_CATEGORIES = {
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

  static SETTINGS = {
    questionsPerRound: config.debug ? 2 : 10,
    numberOfRounds: config.debug ? 6 : 12,
    numberOfAnswerOptions: 4,
    delayAfterAnswer: 500,
    initRandomSort: false,
    dbPath: 'https://raw.githubusercontent.com/alexpataman/art-quiz-data/main',
  };

  constructor(app) {
    this.app = app;
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
    await this.fetchDb();
    this.prepareGameData();
    this.showHomePage();
    this.setHandlers();
    this.prepareSounds();
  }

  showHomePage() {
    const html = document.createElement('section');
    html.className = 'game-options';

    Quiz.QUIZ_TYPES.forEach((el) => {
      const optionWrapper = document.createElement('div');
      const option = document.createElement('a');
      option.href = '#';
      option.dataset.id = el.id;
      option.className = el.id;
      option.textContent = i18next.t(el.title);
      option.addEventListener('click', (event) => this.startGame(event));
      optionWrapper.append(option);
      html.append(optionWrapper);
    });

    this.app.layout.setPageContent(html, 'home');
  }

  showRoundStatisticsPage(roundId) {
    this.app.layout.setPageContent(this.getRoundStatisticsPageContent(roundId), 'round-statistics');
    this.app.layout.addBackLink(this.showRoundSelectorPage, this);
  }

  showRoundSelectorPage() {
    this.loadGameData();
    this.app.layout.setPageContent(this.getRoundSelectorPageContent(), 'round-selector');
    this.app.layout.addBackLink(this.showHomePage, this);
  }

  async startQuestion(roundIndex, questionIndex = 0) {
    this.variables.currentQuestionId = questionIndex;
    this.variables.currentQuestion = this.getQuestion(roundIndex, questionIndex);
    this.variables.currentAnswerOptions = Quiz.shuffleOptions(
      this.variables.currentQuestion.data,
      this.getWrongOptions(),
    );

    await this.app.layout.setPageContent(this.getQuestionPageContent(), 'question');
    this.app.layout.addBackLink(this.showRoundSelectorPage, this);
    this.preloadNextQuestionImages();
    this.variables.timer.init();
  }

  async fetchDb() {
    const request = await fetch(`${Quiz.SETTINGS.dbPath}/data.json`);
    this.db = await request.json();
  }

  getQuestion(roundIndex, questionIndex) {
    return {
      data: this.db[this.settings.data.language][
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
   * - shuffle
   * - keep unique author names only
   */
  getWrongOptions() {
    return this.db[this.settings.data.language]
      .filter((el) => JSON.stringify(el) !== JSON.stringify(this.variables.currentQuestion.data))
      .reduce((acc, item) => {
        if (
          this.variables.currentQuestion.data.author.toLocaleLowerCase() !==
            item.author.toLocaleLowerCase() &&
          acc.every((el) => item.author.toLocaleLowerCase() !== el.author.toLocaleLowerCase())
        ) {
          acc.push(item);
        }
        return acc;
      }, [])
      .sort(() => 0.5 - Math.random())
      .slice(0, Quiz.SETTINGS.numberOfAnswerOptions - 1);
  }

  getQuestionFinalModalContent() {
    const roundStatistics = this.getRoundStatistics(this.variables.currentRoundId);
    const html = document.createElement('div');
    html.className = 'results';

    if (roundStatistics.correct === roundStatistics.total) {
      html.innerHTML = `      
      <div class="great">
        <img src="./assets/svg/round_stars.svg">
        <h3>${i18next.t(`Grand result`)}</h3>        
      </div>`;
    } else if (roundStatistics.correct > 0) {
      html.innerHTML = `      
      <div class="normal">
        <img src="./assets/svg/round_cup.svg">
        <h3>${i18next.t(`Congratulations!`)}</h3>        
      </div>`;
    } else {
      html.innerHTML = `      
      <div class="fail">
        <img src="./assets/svg/round_broken_cup.svg">
        <h3>${i18next.t(`Good luck next time!`)}</h3>        
      </div>`;
    }

    html.innerHTML += `
      <div class="score">
        ${roundStatistics.correct}/${roundStatistics.total}
      </div>
      <div class="nav">
        <button class="button-white home-page">${i18next.t(`Home`)}</button>      
        <button class="button-pink next-quiz">${i18next.t(`Next Quiz`)}</button>      
      </div>
    `;

    html.querySelector('.home-page').addEventListener('click', () => {
      this.app.layout.modal.close();
      this.showHomePage();
    });

    html.querySelector('.next-quiz').addEventListener('click', () => {
      this.app.layout.modal.close();
      this.showRoundSelectorPage();
    });

    return html;
  }

  getQuestionAnswerModalContent(question, isCorrectAnswer, showNextButton = false) {
    const html = document.createElement('div');
    html.innerHTML = `
      <figure class="${isCorrectAnswer ? 'correct' : 'wrong'}">
        <img 
        src="${Quiz.getQuestionImageUrl(question.data.imageNum)}" 
        title="${question.data.name}" 
        alt="${question.data.name}">        
      </figure>
      <div class="details">
        <h3>${question.data.name}</h3>
        <i>
          ${question.data.author}, 
          ${question.data.year}
        </i> 
        <div class="download"><a href="#">${i18next.t(`Download`)}</a></div>
      </div>            
    `;

    html
      .querySelector('.download')
      .addEventListener('click', () =>
        utils.download(
          Quiz.getQuestionImageFullUrl(question.data.imageNum),
          `${question.data.author}-${question.data.name}[${question.data.year}]`,
        ),
      );

    const button = document.createElement('button');
    if (showNextButton) {
      button.className = 'button-pink next-question';
      button.textContent = i18next.t(`Next`);
      button.addEventListener('click', () => {
        this.app.layout.modal.close();
        this.nextQuestion();
      });
    } else {
      button.className = 'button-pink';
      button.textContent = i18next.t(`Close`);
      button.addEventListener('click', () => {
        this.app.layout.modal.close();
      });
    }

    html.append(button);

    return html;
  }

  getRoundStatisticsPageContent(roundId) {
    const html = document.createElement('section');
    html.innerHTML = `<h1>${
      Quiz.QUIZ_CATEGORIES[this.settings.data.language][roundId]
    } / ${i18next.t(`Score`)}</h1>`;
    const items = document.createElement('div');
    items.className = 'items';
    this.data.quizzes[this.variables.gameType].rounds[roundId].questions.forEach(
      (question, index) => {
        const item = document.createElement('div');
        item.className = question.status ? 'correct' : 'wrong';
        item.dataset.id = index;
        item.innerHTML = `
        <img src="${Quiz.getQuestionImageUrl(question.data.imageNum)}" alr="">        
      `;
        item.addEventListener('click', () => {
          this.app.layout.modal.open(
            this.getQuestionAnswerModalContent(this.getQuestion(roundId, index), question.status),
          );
        });
        items.append(item);
      },
    );
    html.append(items);
    return html;
  }

  getRoundSelectorPageContent() {
    const html = document.createElement('section');
    for (let i = 0; i < Quiz.SETTINGS.numberOfRounds; i += 1) {
      const roundStatistics = this.getRoundStatistics(i);
      const option = document.createElement('div');
      option.dataset.roundId = i;

      if (roundStatistics.correct === roundStatistics.total) {
        option.className = 'success';
      } else if (roundStatistics.correct + roundStatistics.wrong > 0) {
        option.className = 'fail';
      } else {
        option.className = 'neutral';
      }

      option.innerHTML = `
        <h3>
          <span>${Quiz.QUIZ_CATEGORIES[this.settings.data.language][i]}</span>
          <span class="score" data-round-id="${i}">
          ${roundStatistics.correct}/${roundStatistics.total}
          </span>
        </h3>
        <div class="category-image">
          <img src="${this.getRoundImageUrl(i)}" alr="">        
          <div class="hover">
            <a href="#" class="statistics" data-round-id="${i}">${i18next.t(`Score`)}</a>
            <a href="#" class="play-again" data-round-id="${i}">${i18next.t(`Play Again`)}</a>
          </div>
        </div>        
      `;

      option.querySelectorAll('.statistics, .score').forEach((el) =>
        el.addEventListener('click', (event) => {
          this.showRoundStatisticsPage(event.currentTarget.dataset.roundId);
        }),
      );

      option
        .querySelector('.play-again')
        .addEventListener('click', (event) => this.startRound(event.currentTarget.dataset.roundId));

      if (roundStatistics.correct + roundStatistics.wrong) {
        option.querySelector('.category-image').addEventListener('click', (event) => {
          this.app.layout.main.querySelectorAll('.touched').forEach((el) => {
            el.classList.remove('touched');
          });
          event.currentTarget.classList.add('touched');
        });
      } else {
        option.addEventListener('click', (event) => {
          this.startRound(event.currentTarget.dataset.roundId);
        });
      }

      html.append(option);
    }

    return html;
  }

  resetRoundProgress(roundId) {
    for (let i = 0; i < Quiz.SETTINGS.questionsPerRound; i += 1) {
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

  getRoundProgressBarContent() {
    const html = document.createElement('ul');
    this.data.quizzes[this.variables.gameType].rounds[
      this.variables.currentRoundId
    ].questions.forEach((el) => {
      const bullet = document.createElement('li');
      if (el.status === true) {
        bullet.className = 'correct';
      } else if (el.status === false) {
        bullet.className = 'wrong';
      } else {
        bullet.className = 'new';
      }
      html.append(bullet);
    });
    return html;
  }

  getQuestionPageContent() {
    const html = document.createElement('section');

    html.append(this.getRoundProgressBarContent());

    switch (this.variables.gameType) {
      case 'artist':
        html.append(this.getQuestionArtistPageContent());
        break;
      case 'pictures':
      default:
        html.append(this.getQuestionPicturesPageContent());
        break;
    }

    return html;
  }

  getQuestionArtistPageContent() {
    const html = document.createElement('div');
    const image = document.createElement('img');
    const answerOptions = document.createElement('div');
    answerOptions.className = 'answer-options artists';

    image.src = Quiz.getQuestionImageUrl(this.variables.currentQuestion.data.imageNum);
    this.variables.currentAnswerOptions.forEach((option, index) => {
      const answerOption = document.createElement('button');
      answerOption.dataset.id = index;
      answerOption.textContent = option.author;
      answerOption.addEventListener('click', (event) =>
        this.processAnswer(event.currentTarget.dataset.id),
      );
      answerOptions.append(answerOption);
    });
    html.append(image);
    html.append(answerOptions);

    return html;
  }

  getQuestionPicturesPageContent() {
    this.app.layout.startLoader();
    const html = document.createElement('div');
    const h2 = document.createElement('h2');
    const questionPlaceholder = i18next.t(`Which picture was painted by {{author}}?`);
    h2.textContent = questionPlaceholder.replace(
      '{{author}}',
      this.variables.currentQuestion.data.author,
    );

    const answerOptions = document.createElement('div');
    answerOptions.className = 'answer-options pictures';

    this.variables.currentAnswerOptions.forEach((option, index) => {
      const imgSrc = Quiz.getQuestionImageUrl(option.imageNum);
      this.app.layout.addLoadingItem(imgSrc);
      Quiz.preloadImage(imgSrc, () => this.app.layout.removeLoadingItem(imgSrc));
      const answerOption = document.createElement('img');
      answerOption.dataset.id = index;
      answerOption.alt = option.name;
      answerOption.title = option.name;
      answerOption.src = Quiz.getQuestionImageUrl(option.imageNum);
      answerOption.addEventListener('click', (event) =>
        this.processAnswer(event.currentTarget.dataset.id),
      );
      answerOptions.append(answerOption);
    });
    html.append(h2);
    html.append(answerOptions);

    return html;
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
        this.getQuestionAnswerModalContent(this.variables.currentQuestion, isCorrectAnswer, true),
      );
    }, Quiz.SETTINGS.delayAfterAnswer);
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
    if (this.variables.currentQuestionId < Quiz.SETTINGS.questionsPerRound - 1) {
      this.variables.currentQuestionId += 1;
      this.startQuestion(this.variables.currentRoundId, this.variables.currentQuestionId);
    } else {
      this.saveGameData();
      setTimeout(() => {
        this.playEffect('roundEnd');
        this.app.layout.modal.open(this.getQuestionFinalModalContent());
      }, Quiz.SETTINGS.delayAfterAnswer);
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

  static getQuestionImageUrl(imageNum) {
    return `${Quiz.SETTINGS.dbPath}/images/small/${imageNum}.jpg`;
  }

  static getQuestionImageFullUrl(imageNum) {
    return `${Quiz.SETTINGS.dbPath}/images/full/${imageNum}full.jpg`;
  }

  getRoundImageUrl(roundId) {
    return `${Quiz.SETTINGS.dbPath}/images/small/${
      this.data.quizzes[this.variables.gameType].rounds[roundId].imageNum
    }.jpg`;
  }

  setupGameData() {
    this.data = {
      settings: {},
      quizzes: {},
    };

    this.setupQuestions();
    this.saveGameData();
  }

  /**
   * Setup questions structure for every game type.
   * Setup shuffled round images.
   */
  setupQuestions() {
    let questions = [...this.db[this.settings.data.language]];
    if (Quiz.SETTINGS.initRandomSort) {
      questions = questions.sort(() => 0.5 - Math.random());
    }

    let i = 0;

    Quiz.QUIZ_TYPES.forEach((quizType) => {
      this.data.quizzes[quizType.id] = {
        rounds: [],
      };

      for (let r = 0; r < Quiz.SETTINGS.numberOfRounds; r += 1) {
        const roundData = {
          questions: [],
          imageNum: null,
        };
        for (let q = 0; q < Quiz.SETTINGS.questionsPerRound; q += 1) {
          roundData.questions.push({
            data: { index: i, imageNum: questions[i].imageNum },
            status: null,
          });
          i += 1;
        }
        roundData.imageNum =
          roundData.questions[
            Math.floor(Math.random() * Quiz.SETTINGS.questionsPerRound)
          ].data.imageNum;

        this.data.quizzes[quizType.id].rounds.push(roundData);
      }
    });
  }

  /**
   * Preload round images
   * Preload first question images
   */
  preloadNecessaryImages() {
    Quiz.QUIZ_TYPES.forEach((type) => {
      this.data.quizzes[type.id].rounds.forEach((el) => {
        Quiz.preloadImage(Quiz.getQuestionImageUrl(el.imageNum));
        Quiz.preloadImage(Quiz.getQuestionImageUrl(el.questions[0].data.imageNum));
      });
    });
  }

  preloadNextQuestionImages() {
    if (this.variables.currentQuestionId < Quiz.SETTINGS.questionsPerRound - 1) {
      const nextQuestion = this.getQuestion(
        this.variables.currentRoundId,
        this.variables.currentQuestionId + 1,
      );
      Quiz.preloadImage(Quiz.getQuestionImageUrl(nextQuestion.data.imageNum));
    }
  }

  static preloadImage(url, callback) {
    const img = new Image();
    img.src = url;
    img.onload = callback;
  }

  prepareGameData() {
    this.loadGameData();
    if (!this.data) {
      this.setupGameData();
    }
    this.preloadNecessaryImages();
  }

  loadGameData() {
    this.data = this.app.storage.exists('gameData') ? this.app.storage.get('gameData') : null;
  }

  saveGameData() {
    this.app.storage.set('gameData', this.data);
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
