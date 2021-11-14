import { layout } from '../main';
import DB from '../data/images';
import config from './config';

export default class Game {
  QUIZ_TYPES = [
    { id: 'artist', title: 'Artist Quiz' },
    { id: 'pictures', title: 'Pictures Quiz' },
  ];

  SETTINGS = {
    questionsPerRound: config.debug ? 2 : 10,
    numberOfRounds: config.debug ? 6 : 12,
    numberOfAnswerOptions: 4,
    delayAfterAnswer: 500,
    initRandomSort: false,
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

  showRoundStatisticsPage(roundId) {
    layout.setPageContent(
      this.getRoundStatisticsPageContent(roundId),
      'round-statistics'
    );
    layout.addBackLink(this.showRoundSelectorPage, this);
  }

  showRoundSelectorPage() {
    this.loadGameData();
    layout.setPageContent(this.getRoundSelectorPageContent(), 'round-selector');
    layout.addBackLink(this.showHomePage, this);
  }

  startQuestion(roundIndex, questionIndex = 0) {
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
        if (
          acc.every(
            (el) =>
              item.author.toLocaleLowerCase() !==
                el.author.toLocaleLowerCase() &&
              this.variables.currentQuestion.data.author.toLocaleLowerCase() !==
                item.author.toLocaleLowerCase()
          )
        ) {
          acc.push(item);
        }
        return acc;
      }, [])
      .slice(0, this.SETTINGS.numberOfAnswerOptions - 1);
  }

  getQuestionFinalModalContent() {
    const roundStatistics = this.getRoundStatistics(
      this.variables.currentRoundId
    );
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

  getQuestionAnswerModalContent(
    question,
    isCorrectAnswer,
    showNextButton = false
  ) {
    const html = document.createElement('div');
    html.innerHTML = `
      <figure class="${isCorrectAnswer ? 'correct' : 'wrong'}">
        <img 
        src="${this.getQuestionImageUrl(question.data.imageNum)}" 
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
    const roundStatistics = this.getRoundStatistics(roundId);
    this.data.quizzes[this.variables.gameType].rounds[
      roundId
    ].questions.forEach((question, index) => {
      let item = document.createElement('div');
      item.className = question.status ? 'correct' : 'wrong';
      item.dataset['id'] = index;
      item.innerHTML = `
        <img src="${this.getQuestionImageUrl(
          question.data.imageNum
        )}" alr="">        
      `;
      item.addEventListener('click', () => {
        layout.modal.open(
          this.getQuestionAnswerModalContent(question, question.status)
        );
      });
      items.append(item);
    });
    html.append(items);
    return html;
  }

  getRoundSelectorPageContent() {
    const html = document.createElement('section');
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
        option.addEventListener('click', (event) =>
          this.startRound(event.currentTarget.dataset['roundId'])
        );
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
            <a href="#" class="statistics" data-round-id="${i}">Score</a>
            <a href="#" class="play-again" data-round-id="${i}">Play Again</a>
          </div>
        </div>        
      `;

      option.querySelector('.statistics').addEventListener('click', (event) => {
        this.showRoundStatisticsPage(event.currentTarget.dataset['roundId']);
      });

      option
        .querySelector('.play-again')
        .addEventListener('click', (event) =>
          this.startRound(event.currentTarget.dataset['roundId'])
        );

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
      layout.modal.open(
        this.getQuestionAnswerModalContent(
          this.variables.currentQuestion,
          isCorrectAnswer,
          true
        )
      );
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
    if (
      this.variables.currentQuestionId <
      this.SETTINGS.questionsPerRound - 1
    ) {
      this.variables.currentQuestionId++;
      this.startQuestion(
        this.variables.currentRoundId,
        this.variables.currentQuestionId
      );
    } else {
      this.saveGameData();
      setTimeout(
        () => layout.modal.open(this.getQuestionFinalModalContent()),
        this.SETTINGS.delayAfterAnswer
      );
    }
  }

  nextRound() {
    this.variables.currentRoundId++;
    this.variables.currentQuestionId = 0;
    this.startQuestion(
      this.variables.currentRoundId,
      this.variables.currentQuestionId
    );
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

  getRoundImageUrl(roundId) {
    return this.SETTINGS.imagePath.replace(
      '{{imageNum}}',
      this.data.quizzes[this.variables.gameType].rounds[roundId].imageNum
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

    let questions = [...DB];
    if (this.SETTINGS.initRandomSort) {
      questions = questions.sort((a, b) => 0.5 - Math.random());
    }
    questions = questions.slice(
      0,
      this.SETTINGS.numberOfRounds * this.SETTINGS.questionsPerRound
    );

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

  startRound(roundId) {
    this.variables.currentRoundId = roundId;
    this.resetRoundProgress(this.variables.currentRoundId);
    this.startQuestion(this.variables.currentRoundId);
  }
}
