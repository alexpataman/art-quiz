import layout from './Layout';
import DB from '../data/images';
import config from './config';
import settings from './settings';
import sounds from './sounds';

class Game {
  static QUIZ_TYPES = [
    { id: 'artist', title: 'Artist Quiz' },
    { id: 'pictures', title: 'Pictures Quiz' },
  ];

  static SETTINGS = {
    questionsPerRound: config.debug ? 2 : 10,
    numberOfRounds: config.debug ? 6 : 12,
    numberOfAnswerOptions: 4,
    delayAfterAnswer: 500,
    initRandomSort: false,
    imagePath:
      'https://raw.githubusercontent.com/alexpataman/image-data/master/img/{{imageNum}}.jpg',
  };

  constructor() {
    this.variables = {
      gameType: null,
      currentRoundId: null,
      currentQuestionId: null,
      currentQuestion: null,
      currentAnswerOptions: null,
    };
  }

  init() {
    this.prepareGameData();
    this.showHomePage();
    this.setHandlers();
    Game.prepareSounds();
  }

  showHomePage() {
    const html = document.createElement('section');
    html.className = 'game-options';

    Game.QUIZ_TYPES.forEach((el) => {
      const optionWrapper = document.createElement('div');
      const option = document.createElement('a');
      option.href = '#';
      option.dataset.id = el.id;
      option.className = el.id;
      option.textContent = el.title;
      option.addEventListener('click', (event) => this.startGame(event));
      optionWrapper.append(option);
      html.append(optionWrapper);
    });

    layout.setPageContent(html, 'home');
  }

  showRoundStatisticsPage(roundId) {
    layout.setPageContent(this.getRoundStatisticsPageContent(roundId), 'round-statistics');
    layout.addBackLink(this.showRoundSelectorPage, this);
  }

  showRoundSelectorPage() {
    this.loadGameData();
    layout.setPageContent(this.getRoundSelectorPageContent(), 'round-selector');
    layout.addBackLink(this.showHomePage, this);
  }

  startQuestion(roundIndex, questionIndex = 0) {
    this.variables.currentQuestionId = questionIndex;
    this.variables.currentQuestion = this.getQuestion(roundIndex, questionIndex);
    this.variables.currentAnswerOptions = Game.shuffleOptions(
      this.variables.currentQuestion.data,
      this.getWrongOptions(),
    );

    layout.setPageContent(this.getQuestionPageContent(), 'question');
    layout.addBackLink(this.showRoundSelectorPage, this);
    this.preloadNextQuestionImages();
  }

  getQuestion(roundIndex, questionIndex) {
    return this.data.quizzes[this.variables.gameType].rounds[roundIndex].questions[questionIndex];
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
    return DB.filter(
      (el) => JSON.stringify(el) !== JSON.stringify(this.variables.currentQuestion.data),
    )
      .sort(() => 0.5 - Math.random())
      .reduce((acc, item) => {
        if (
          acc.every(
            (el) =>
              item.author.toLocaleLowerCase() !== el.author.toLocaleLowerCase() &&
              this.variables.currentQuestion.data.author.toLocaleLowerCase() !==
                item.author.toLocaleLowerCase(),
          )
        ) {
          acc.push(item);
        }
        return acc;
      }, [])
      .slice(0, Game.SETTINGS.numberOfAnswerOptions - 1);
  }

  getQuestionFinalModalContent() {
    const roundStatistics = this.getRoundStatistics(this.variables.currentRoundId);
    const html = document.createElement('div');
    html.className = 'results';

    if (roundStatistics.correct === roundStatistics.total) {
      html.innerHTML = `      
      <div class="great">
        <img src="./assets/svg/round_stars.svg">
        <h3>Grand result</h3>        
      </div>`;
    } else if (roundStatistics.correct > 0) {
      html.innerHTML = `      
      <div class="normal">
        <img src="./assets/svg/round_cup.svg">
        <h3>Congratulations!</h3>        
      </div>`;
    } else {
      html.innerHTML = `      
      <div class="fail">
        <img src="./assets/svg/round_broken_cup.svg">
        <h3>Good luck next time!</h3>        
      </div>`;
    }

    html.innerHTML += `
      <div class="score">
        ${roundStatistics.correct}/${roundStatistics.total}
      </div>
      <div class="nav">
        <button class="button-white home-page">Home</button>      
        <button class="button-pink next-quiz">Next Quiz</button>      
      </div>
    `;

    html.querySelector('.home-page').addEventListener('click', () => {
      layout.modal.close();
      this.showHomePage();
    });

    html.querySelector('.next-quiz').addEventListener('click', () => {
      layout.modal.close();
      this.showRoundSelectorPage();
    });

    return html;
  }

  getQuestionAnswerModalContent(question, isCorrectAnswer, showNextButton = false) {
    const html = document.createElement('div');
    html.innerHTML = `
      <figure class="${isCorrectAnswer ? 'correct' : 'wrong'}">
        <img 
        src="${Game.getQuestionImageUrl(question.data.imageNum)}" 
        title="${question.data.name}" 
        alt="${question.data.name}">
      </figure>
      <div class="details">
        <h3>${question.data.name}</h3>
        <i>
          ${question.data.author}, 
          ${question.data.year}
        </i> 
      </div>            
    `;

    const button = document.createElement('button');
    if (showNextButton) {
      button.className = 'button-pink next-question';
      button.textContent = 'Next';
      button.addEventListener('click', () => {
        layout.modal.close();
        this.nextQuestion();
      });
    } else {
      button.className = 'button-pink';
      button.textContent = 'Close';
      button.addEventListener('click', () => {
        layout.modal.close();
      });
    }

    html.append(button);

    return html;
  }

  getRoundStatisticsPageContent(roundId) {
    const html = document.createElement('section');
    html.innerHTML = `<h1>Category #${roundId + 1} / Score</h1>`;
    const items = document.createElement('div');
    items.className = 'items';
    this.data.quizzes[this.variables.gameType].rounds[roundId].questions.forEach(
      (question, index) => {
        const item = document.createElement('div');
        item.className = question.status ? 'correct' : 'wrong';
        item.dataset.id = index;
        item.innerHTML = `
        <img src="${Game.getQuestionImageUrl(question.data.imageNum)}" alr="">        
      `;
        item.addEventListener('click', () => {
          layout.modal.open(this.getQuestionAnswerModalContent(question, question.status));
        });
        items.append(item);
      },
    );
    html.append(items);
    return html;
  }

  getRoundSelectorPageContent() {
    const html = document.createElement('section');
    for (let i = 0; i < Game.SETTINGS.numberOfRounds; i += 1) {
      const roundStatistics = this.getRoundStatistics(i);
      const option = document.createElement('div');
      option.dataset.roundId = i;
      if (roundStatistics.correct + roundStatistics.wrong) {
        option.addEventListener('click', (event) => {
          layout.main.querySelectorAll('.touched').forEach((el) => {
            el.classList.remove('touched');
          });
          event.currentTarget.classList.add('touched');
        });
      } else {
        option.addEventListener('click', (event) => {
          this.startRound(event.currentTarget.dataset.roundId);
        });
      }

      if (roundStatistics.correct === roundStatistics.total) {
        option.className = 'success';
      } else if (roundStatistics.correct + roundStatistics.wrong > 0) {
        option.className = 'fail';
      } else {
        option.className = 'neutral';
      }

      option.innerHTML = `
        <h3>
          <span>Category #${i + 1}</span>
          <span class="score">
          ${roundStatistics.correct}/${roundStatistics.total}
          </span>
        </h3>
        <div class="category-image">
          <img src="${this.getRoundImageUrl(i)}" alr="">        
          <div class="hover">
            <a href="#" class="statistics" data-round-id="${i}">Score</a>
            <a href="#" class="play-again" data-round-id="${i}">Play Again</a>
          </div>
        </div>        
      `;

      option.querySelector('.statistics').addEventListener('click', (event) => {
        this.showRoundStatisticsPage(event.currentTarget.dataset.roundId);
      });

      option
        .querySelector('.play-again')
        .addEventListener('click', (event) => this.startRound(event.currentTarget.dataset.roundId));

      html.append(option);
    }

    return html;
  }

  resetRoundProgress(roundId) {
    for (let i = 0; i < Game.SETTINGS.questionsPerRound; i += 1) {
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

    switch (this.variables.gameType) {
      case 'artist':
        html.append(this.getQuestionArtistPageContent());
        break;
      case 'pictures':
      default:
        html.append(this.getQuestionPicturesPageContent());
        break;
    }

    html.append(this.getRoundProgressBarContent());
    return html;
  }

  getQuestionArtistPageContent() {
    const html = document.createElement('div');
    const image = document.createElement('img');
    const answerOptions = document.createElement('div');
    answerOptions.className = 'answer-options';

    image.src = Game.getQuestionImageUrl(this.variables.currentQuestion.data.imageNum);
    this.variables.currentAnswerOptions.forEach((option, index) => {
      const answerOption = document.createElement('button');
      answerOption.dataset.id = index;
      answerOption.textContent = option.author;
      answerOption.addEventListener('click', (event) => this.processAnswer(event));
      answerOptions.append(answerOption);
    });
    html.append(image);
    html.append(answerOptions);

    return html;
  }

  getQuestionPicturesPageContent() {
    const html = document.createElement('div');
    const h2 = document.createElement('h2');
    h2.textContent = `Какую картину нарисовал ${this.variables.currentQuestion.data.author}?`;

    const answerOptions = document.createElement('div');
    answerOptions.className = 'answer-options';

    this.variables.currentAnswerOptions.forEach((option, index) => {
      const answerOption = document.createElement('img');
      answerOption.dataset.id = index;
      answerOption.alt = option.name;
      answerOption.title = option.name;
      answerOption.src = Game.getQuestionImageUrl(option.imageNum);
      answerOption.addEventListener('click', (event) => this.processAnswer(event));
      answerOptions.append(answerOption);
    });
    html.append(h2);
    html.append(answerOptions);

    return html;
  }

  processAnswer(event) {
    const userAnswerId = event.currentTarget.dataset.id;
    const isCorrectAnswer = this.isCorrectAnswer(userAnswerId);
    if (isCorrectAnswer) {
      Game.playEffect('answerCorrect');
    } else {
      Game.playEffect('answerWrong');
    }
    this.highlightAnswers(userAnswerId);
    this.setUserAnswer(isCorrectAnswer);
    setTimeout(() => {
      layout.modal.open(
        this.getQuestionAnswerModalContent(this.variables.currentQuestion, isCorrectAnswer, true),
      );
    }, Game.SETTINGS.delayAfterAnswer);
  }

  highlightAnswers(userAnswerId) {
    layout.main.querySelectorAll('.answer-options > *').forEach((el, index) => {
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
    if (this.variables.currentQuestionId < Game.SETTINGS.questionsPerRound - 1) {
      this.variables.currentQuestionId += 1;
      this.startQuestion(this.variables.currentRoundId, this.variables.currentQuestionId);
    } else {
      this.saveGameData();
      setTimeout(
        () => layout.modal.open(this.getQuestionFinalModalContent()),
        Game.SETTINGS.delayAfterAnswer,
      );
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
    return Game.SETTINGS.imagePath.replace('{{imageNum}}', imageNum);
  }

  getRoundImageUrl(roundId) {
    return Game.SETTINGS.imagePath.replace(
      '{{imageNum}}',
      this.data.quizzes[this.variables.gameType].rounds[roundId].imageNum,
    );
  }

  setupGameData() {
    this.data = {
      settings: {},
      quizzes: {},
    };

    Game.QUIZ_TYPES.forEach((quizType) => {
      this.data.quizzes[quizType.id] = {
        rounds: [],
      };
      this.setupQuestions(quizType.id);
    });

    this.saveGameData();
  }

  setupQuestions(quizType) {
    if (DB.length <= Game.SETTINGS.numberOfRounds * Game.SETTINGS.questionsPerRound) {
      throw new Error('Wrong game settings. Number of questions in the database is too low.');
    }

    let questions = [...DB];
    if (Game.SETTINGS.initRandomSort) {
      questions = questions.sort(() => 0.5 - Math.random());
    }
    questions = questions.slice(0, Game.SETTINGS.numberOfRounds * Game.SETTINGS.questionsPerRound);

    let i = 0;
    for (let r = 0; r < Game.SETTINGS.numberOfRounds; r += 1) {
      const roundData = {
        questions: [],
        imageNum: null,
      };
      for (let q = 0; q < Game.SETTINGS.questionsPerRound; q += 1) {
        roundData.questions.push({
          data: questions[i],
          status: null,
        });
        i += 1;
      }
      roundData.imageNum =
        roundData.questions[
          Math.floor(Math.random() * Game.SETTINGS.questionsPerRound)
        ].data.imageNum;
      this.data.quizzes[quizType].rounds.push(roundData);
    }
  }

  /**
   * Preload round images
   * Preload first question images
   */
  preloadNecessaryImages() {
    Game.QUIZ_TYPES.forEach((type) => {
      this.data.quizzes[type.id].rounds.forEach((el) => {
        Game.preloadImage(Game.getQuestionImageUrl(el.imageNum));
        Game.preloadImage(Game.getQuestionImageUrl(el.questions[0].data.imageNum));
      });
    });
  }

  preloadNextQuestionImages() {
    if (this.variables.currentQuestionId < Game.SETTINGS.questionsPerRound - 1) {
      const nextQuestion = this.getQuestion(
        this.variables.currentRoundId,
        this.variables.currentQuestionId + 1,
      );
      Game.preloadImage(Game.getQuestionImageUrl(nextQuestion.data.imageNum));
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
    this.data = localStorage.gameData ? JSON.parse(localStorage.gameData) : null;
  }

  saveGameData() {
    localStorage.gameData = JSON.stringify(this.data);
  }

  startGame(event) {
    this.variables.gameType = event.target.dataset.id;
    this.showRoundSelectorPage();
    Game.playMusic();
  }

  static prepareSounds() {
    sounds.setVolume('music', settings.data.musicVolumeLevel);
    sounds.setVolume('effects', settings.data.musicVolumeLevel);
  }

  static playMusic() {
    if (settings.data.enableMusic) {
      sounds.playMusic();
    }
  }

  static playEffect(key) {
    if (settings.data.enableSoundEffects) {
      sounds.playEffect(key);
    }
  }

  startRound(roundId) {
    this.variables.currentRoundId = roundId;
    this.resetRoundProgress(this.variables.currentRoundId);
    this.startQuestion(this.variables.currentRoundId);
  }

  setHandlers() {
    layout.header.querySelector('.logo').addEventListener('click', () => this.showHomePage());
  }
}

export default new Game();
