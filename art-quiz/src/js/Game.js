import { layout } from '../main';
import DB from '../data/images';
import config from './config';

export default class Game {
  QUIZ_TYPES = [
    { id: 'artist', title: 'Artist Quiz' },
    { id: 'pictures', title: 'Pictures Quiz' },
  ];

  SETTINGS = {
    questionsPerRound: config.debug ? 3 : 10,
    numberOfRounds: config.debug ? 6 : 12,
    numberOfAnswerOptions: 4,
    delayAfterAnswer: 500,
    imagePath:
      'https://raw.githubusercontent.com/alexpataman/image-data/master/img/{{imageNum}}.jpg',
  };

  constructor() {
    this.prepareGameData();
    this.showHomePage();
    this.variables = {
      gameType: null,
      currentRoundId: null,
      currentQuestionId: null,
      currentQuestion: null,
      currentAnswerOptions: null,
    };
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
    this.loadGameData();
    layout.setPageContent(this.getRoundSelectorPageContent(), 'round-selector');
    layout.addBackLink(this.showHomePage, this);
  }

  startQuestion(roundIndex, questionIndex = 0) {
    console.log(roundIndex, questionIndex);
    this.variables.currentQuestionId = questionIndex;
    this.variables.currentQuestion = this.getQuestion(
      roundIndex,
      questionIndex
    );
    this.variables.currentAnswerOptions = this.shuffleOptions(
      this.variables.currentQuestion.data,
      this.getWrongOptions()
    );

    layout.setPageContent(this.getQuestionPageContent(), 'question');
    layout.addBackLink(this.showRoundSelectorPage, this);
    this.preloadNextQuestionImages();
  }

  getQuestion(roundIndex, questionIndex) {
    return this.data.quizzes[this.variables.gameType].rounds[roundIndex]
      .questions[questionIndex];
  }

  shuffleOptions(correctAnswer, wrongOptions) {
    return wrongOptions
      .concat(correctAnswer)
      .sort((a, b) => 0.5 - Math.random());
  }

  /**
   *  Getting wrong answer options
   * - exclude correct answer
   * - shuffle
   * - keep unique author names only
   */
  getWrongOptions() {
    return DB.filter(
      (el) =>
        JSON.stringify(el) !==
        JSON.stringify(this.variables.currentQuestion.data)
    )
      .sort((a, b) => 0.5 - Math.random())
      .reduce((acc, item) => {
        if (!acc.some((el) => item.author === el.author)) {
          acc.push(item);
        }
        return acc;
      }, [])
      .slice(0, this.SETTINGS.numberOfAnswerOptions - 1);
  }

  getQuestionAnswerModalContent(isCorrectAnswer) {
    const html = document.createElement('div');
    html.innerHTML = `
      <figure class="${isCorrectAnswer ? 'correct' : 'wrong'}">
        <img 
        src="${this.getQuestionImageUrl(
          this.variables.currentQuestion.data.imageNum
        )}" 
        title="${this.variables.currentQuestion.data.name}" 
        alt="${this.variables.currentQuestion.data.name}">
      </figure>
      <div class="details">
        <h3>${this.variables.currentQuestion.data.name}</h3>
        <i>
          ${this.variables.currentQuestion.data.author}, 
          ${this.variables.currentQuestion.data.year}
        </i> 
      </div>     
      <button class="button-pink next-question">Next</button>      
    `;

    html
      .querySelector('.next-question')
      .addEventListener('click', () => this.nextQuestion());

    return html;
  }

  getRoundSelectorPageContent() {
    let html = document.createElement('section');
    for (let i = 0; i < this.SETTINGS.numberOfRounds; i++) {
      const roundStatistics = this.getRoundStatistics(i);
      const option = document.createElement('div');
      option.dataset['roundId'] = i;
      if (roundStatistics.correct + roundStatistics.wrong) {
        option.addEventListener('click', (event) => {
          layout.main.querySelectorAll('.touched').forEach((el) => {
            el.classList.remove('touched');
          });
          event.currentTarget.classList.add('touched');
        });
      } else {
        option.addEventListener('click', (event) => this.startRound(event));
      }

      option.className =
        roundStatistics.correct === roundStatistics.total
          ? 'success'
          : roundStatistics.correct + roundStatistics.wrong > 0
          ? 'fail'
          : 'neutral';
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
            <a href="#" class="statistics" data-round-id="${i}">Statistics</a>
            <a href="#" class="play-again" data-round-id="${i}">Play Again</a>
          </div>
        </div>        
      `;

      option.querySelector('.statistics').addEventListener('click', (event) => {
        console.log('statistics for', event.currentTarget.dataset['id']);
      });

      option
        .querySelector('.play-again')
        .addEventListener('click', (event) => this.startRound(event));

      html.append(option);
    }

    return html;
  }

  resetRoundProgress(roundId) {
    for (let i = 0; i < this.SETTINGS.questionsPerRound; i++) {
      this.data.quizzes[this.variables.gameType].rounds[roundId].questions[
        i
      ].status = null;
    }
    //this.saveGameData();
  }

  getRoundStatistics(roundId) {
    return this.data.quizzes[this.variables.gameType].rounds[
      roundId
    ].questions.reduce(
      (acc, el) => {
        acc.total++;
        if (el.status === true) {
          acc.correct++;
        } else if (el.status === false) {
          acc.wrong++;
        }
        return acc;
      },
      {
        correct: 0,
        wrong: 0,
        total: 0,
      }
    );
  }

  getRoundProgressBarContent() {
    const html = document.createElement('ul');
    this.data.quizzes[this.variables.gameType].rounds[
      this.variables.currentRoundId
    ].questions.forEach((el) => {
      const bullet = document.createElement('li');
      bullet.className =
        el.status === true ? 'correct' : el.status === false ? 'wrong' : 'new';
      html.append(bullet);
    });
    return html;
  }

  getQuestionPageContent() {
    // console.log(
    //   this.variables.currentQuestion,
    //   this.variables.currentAnswerOptions
    // );
    const html = document.createElement('section');

    switch (this.variables.gameType) {
      case 'artist':
        html.append(this.getQuestionArtistPageContent());
        break;
      case 'pictures':
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

    image.src = this.getQuestionImageUrl(
      this.variables.currentQuestion.data.imageNum
    );
    this.variables.currentAnswerOptions.forEach((option, index) => {
      const answerOption = document.createElement('button');
      answerOption.dataset['id'] = index;
      answerOption.textContent = option.author;
      answerOption.addEventListener('click', (event) =>
        this.processAnswer(event)
      );
      answerOptions.append(answerOption);
    });
    html.append(image);
    html.append(answerOptions);

    return html;
  }

  getQuestionPicturesPageContent() {
    const html = document.createElement('div');
    const h2 = document.createElement('h2');
    console.log(this.variables);
    h2.textContent = `Какую картину нарисовал ${this.variables.currentQuestion.data.author}?`;

    const answerOptions = document.createElement('div');
    answerOptions.className = 'answer-options';

    this.variables.currentAnswerOptions.forEach((option, index) => {
      const answerOption = document.createElement('img');
      answerOption.dataset['id'] = index;
      answerOption.alt = option.name;
      answerOption.title = option.name;
      answerOption.src = this.getQuestionImageUrl(option.imageNum);
      answerOption.addEventListener('click', (event) =>
        this.processAnswer(event)
      );
      answerOptions.append(answerOption);
    });
    html.append(h2);
    html.append(answerOptions);

    return html;
  }

  processAnswer(event) {
    const userAnswerId = event.currentTarget.dataset['id'];
    const isCorrectAnswer = this.isCorrectAnswer(userAnswerId);
    this.highlightAnswers(userAnswerId);
    this.setUserAnswer(isCorrectAnswer);
    setTimeout(() => {
      layout.openModal(this.getQuestionAnswerModalContent(isCorrectAnswer));
    }, this.SETTINGS.delayAfterAnswer);
  }

  highlightAnswers(userAnswerId) {
    layout.main.querySelectorAll('.answer-options > *').forEach((el, index) => {
      if (index === +userAnswerId) {
        if (
          el.textContent === this.variables.currentQuestion.data.author ||
          el.title === this.variables.currentQuestion.data.name
        ) {
          el.className = 'correct';
        } else {
          el.className = 'wrong';
        }
      }
    });
  }

  nextQuestion() {
    if (layout.modalInstance.isOpen) {
      layout.modalInstance.close();
    }

    if (
      this.variables.currentQuestionId <
      this.SETTINGS.questionsPerRound - 1
    ) {
      this.variables.currentQuestionId++;
      this.startQuestion(
        this.variables.currentRoundId,
        this.variables.currentQuestionId
      );
    } else if (
      this.variables.currentRoundId <
      this.SETTINGS.numberOfRounds - 1
    ) {
      this.saveGameData();
      this.variables.currentRoundId++;
      this.variables.currentQuestionId = 0;
      this.startQuestion(
        this.variables.currentRoundId,
        this.variables.currentQuestionId
      );
    } else {
      this.showHomePage();
    }
  }

  setUserAnswer(value) {
    this.data.quizzes[this.variables.gameType].rounds[
      this.variables.currentRoundId
    ].questions[this.variables.currentQuestionId].status = value;
  }

  isCorrectAnswer(id) {
    const answerOption = this.variables.currentAnswerOptions[id];
    return (
      JSON.stringify(answerOption) ===
      JSON.stringify(this.variables.currentQuestion.data)
    );
  }

  getQuestionImageUrl(imageNum) {
    return this.SETTINGS.imagePath.replace('{{imageNum}}', imageNum);
  }

  getRoundImageUrl(roundID) {
    return this.SETTINGS.imagePath.replace(
      '{{imageNum}}',
      this.data.quizzes[this.variables.gameType].rounds[roundID].imageNum
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
      DB.length <=
      this.SETTINGS.numberOfRounds * this.SETTINGS.questionsPerRound
    ) {
      throw new Error(
        'Wrong game settings. Number of questions in the database is too low.'
      );
    }

    const questions = [...DB]
      .sort((a, b) => 0.5 - Math.random())
      .slice(0, this.SETTINGS.numberOfRounds * this.SETTINGS.questionsPerRound);

    let i = 0;
    for (let r = 0; r < this.SETTINGS.numberOfRounds; r++) {
      const roundData = {
        questions: [],
        imageNum: null,
      };
      for (let q = 0; q < this.SETTINGS.questionsPerRound; q++) {
        roundData.questions.push({
          data: questions[i],
          status: null,
        });
        i++;
      }
      roundData.imageNum =
        roundData.questions[
          Math.floor(Math.random() * this.SETTINGS.questionsPerRound)
        ].data.imageNum;
      this.data.quizzes[quizType].rounds.push(roundData);
    }
  }

  /**
   * Preload round images
   * Preload first question images
   */
  preloadNecessaryImages() {
    this.QUIZ_TYPES.forEach((type) => {
      this.data.quizzes[type.id].rounds.forEach((el) => {
        this.preloadImage(this.getQuestionImageUrl(el.imageNum));
        this.preloadImage(
          this.getQuestionImageUrl(el.questions[0].data.imageNum)
        );
      });
    });
  }

  preloadNextQuestionImages() {
    if (
      this.variables.currentQuestionId <
      this.SETTINGS.questionsPerRound - 1
    ) {
      const nextQuestion = this.getQuestion(
        this.variables.currentRoundId,
        this.variables.currentQuestionId + 1
      );
      this.preloadImage(this.getQuestionImageUrl(nextQuestion.data.imageNum));
    }
  }

  preloadImage(url, callback) {
    var img = new Image();
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
    this.data = localStorage._gameData
      ? JSON.parse(localStorage._gameData)
      : null;
  }

  saveGameData() {
    localStorage._gameData = JSON.stringify(this.data);
  }

  startGame(event) {
    this.variables.gameType = event.target.dataset['id'];
    this.showRoundSelectorPage();
  }

  startRound(event) {
    this.variables.currentRoundId = event.currentTarget.dataset['roundId'];
    this.resetRoundProgress(this.variables.currentRoundId);
    this.startQuestion(this.variables.currentRoundId);
  }
}
