import { layout } from '../main';
import DB from '../data/images';

export default class Game {
  QUIZ_TYPES = [
    { id: 'artist', title: 'Artist Quiz' },
    { id: 'pictures', title: 'Pictures Quiz' },
  ];

  SETTINGS = {
    questionsPerRound: 3,
    numberOfRounds: 6,
    numberOfAnswerOptions: 4,
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

  getRoundSelectorPageContent() {
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

  getRoundProgressBarContent() {
    const html = document.createElement('ul');
    this.data.quizzes[this.variables.gameType].rounds[
      this.variables.currentRoundId
    ].questions.forEach((el) => {
      const bullet = document.createElement('li');
      bullet.className =
        el.status === true ? 'correct' : el.status === false ? 'wrong' : 'new';
      bullet.textContent = bullet.className;
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
    h2.textContent =
      'Какую картину нарисовал ' + this.variables.currentQuestion.data.author;

    const answerOptions = document.createElement('div');

    this.variables.currentAnswerOptions.forEach((option, index) => {
      const answerOption = document.createElement('img');
      answerOption.dataset['id'] = index;
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
    const isCorrectAnswer = this.isCorrectAnswer(event);
    this.setUserAnswer(isCorrectAnswer);
    if (isCorrectAnswer) {
      console.log('correct');
    } else {
      console.log('wrong');
    }
    this.nextQuestion();
    //console.log(this.variables);
    //console.log(this.data);
  }

  nextQuestion() {
    console.log(this.variables);
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

  isCorrectAnswer(event) {
    const answerOption =
      this.variables.currentAnswerOptions[event.currentTarget.dataset['id']];
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
    this.variables.gameType = event.target.dataset['id'];
    this.showRoundSelectorPage();
  }

  startRound(event) {
    this.variables.currentRoundId = event.currentTarget.dataset['roundId'];
    this.startQuestion(this.variables.currentRoundId);
  }
}
