import i18next from 'i18next';
import * as utils from '../utils';

export default class View {
  constructor(controller) {
    this.main = controller;
  }

  getQuestionFinalModalContent() {
    const roundStatistics = this.main.getRoundStatistics(this.main.variables.currentRoundId);
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

    const homePageButton = html.querySelector('.home-page');

    homePageButton.addEventListener(
      'click',
      () => {
        this.main.app.layout.modal.close();
        this.main.showHomePage();
      },
      { once: true },
    );

    const nextQuizButton = html.querySelector('.next-quiz');

    nextQuizButton.addEventListener(
      'click',
      () => {
        this.main.app.layout.modal.close();
        this.main.showRoundSelectorPage();
      },
      { once: true },
    );

    return html;
  }

  getQuestionAnswerModalContent(question, isCorrectAnswer, showNextButton = false) {
    const html = document.createElement('div');
    html.innerHTML = `
      <figure class="${isCorrectAnswer ? 'correct' : 'wrong'}">
        <img 
        src="${this.main.getQuestionImageUrl(question.data.imageNum)}" 
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
      .addEventListener(
        'click',
        () =>
          utils.download(
            this.main.getQuestionImageFullUrl(question.data.imageNum),
            `${question.data.author}-${question.data.name}[${question.data.year}]`,
          ),
        { once: true },
      );

    const button = document.createElement('button');
    if (showNextButton) {
      button.className = 'button-pink next-question';
      button.textContent = i18next.t(`Next`);
      button.addEventListener(
        'click',
        () => {
          this.main.app.layout.modal.close();
          this.main.nextQuestion();
        },
        { once: true },
      );
    } else {
      button.className = 'button-pink';
      button.textContent = i18next.t(`Close`);
      button.addEventListener(
        'click',
        () => {
          this.main.app.layout.modal.close();
        },
        { once: true },
      );
    }

    html.append(button);

    return html;
  }

  getRoundStatisticsPageContent(roundId) {
    const html = document.createElement('section');
    html.innerHTML = `<h1>${
      this.main.model.QUIZ_CATEGORIES[this.main.settings.data.language][roundId]
    } / ${i18next.t(`Score`)}</h1>`;
    const items = document.createElement('div');
    items.className = 'items';
    this.main.data.quizzes[this.main.variables.gameType].rounds[roundId].questions.forEach(
      (question, index) => {
        const item = document.createElement('div');
        item.className = question.status ? 'correct' : 'wrong';
        item.dataset.id = index;
        item.innerHTML = `
        <img src="${this.main.getQuestionImageUrl(question.data.imageNum)}" alr="">        
      `;
        item.addEventListener(
          'click',
          () => {
            this.main.app.layout.modal.open(
              this.getQuestionAnswerModalContent(
                this.main.getQuestion(roundId, index),
                question.status,
              ),
            );
          },
          { once: true },
        );
        items.append(item);
      },
    );
    html.append(items);
    return html;
  }

  getRoundSelectorPageContent() {
    const html = document.createElement('section');
    for (let i = 0; i < this.main.SETTINGS.numberOfRounds; i += 1) {
      const roundStatistics = this.main.getRoundStatistics(i);
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
          <span>${this.main.model.QUIZ_CATEGORIES[this.main.settings.data.language][i]}</span>
          <span class="score" data-round-id="${i}">
          ${roundStatistics.correct}/${roundStatistics.total}
          </span>
        </h3>
        <div class="category-image">
          <img src="${this.main.getRoundImageUrl(i)}" alr="">        
          <div class="hover">
            <a href="#" class="statistics" data-round-id="${i}">${i18next.t(`Score`)}</a>
            <a href="#" class="play-again" data-round-id="${i}">${i18next.t(`Play Again`)}</a>
          </div>
        </div>        
      `;

      const statisticsButtons = option.querySelectorAll('.statistics, .score');

      statisticsButtons.forEach((el) =>
        el.addEventListener(
          'click',
          (event) => {
            this.main.showRoundStatisticsPage(event.currentTarget.dataset.roundId);
          },
          { once: true },
        ),
      );

      option
        .querySelector('.play-again')
        .addEventListener(
          'click',
          (event) => this.main.startRound(event.currentTarget.dataset.roundId),
          { once: true },
        );

      if (roundStatistics.correct + roundStatistics.wrong) {
        option.querySelector('.category-image').addEventListener(
          'click',
          (event) => {
            this.main.app.layout.main.querySelectorAll('.touched').forEach((el) => {
              el.classList.remove('touched');
            });
            event.currentTarget.classList.add('touched');
          },
          { once: true },
        );
      } else {
        option.addEventListener(
          'click',
          (event) => {
            this.main.startRound(event.currentTarget.dataset.roundId);
          },
          { once: true },
        );
      }

      html.append(option);
    }

    return html;
  }

  getRoundProgressBarContent() {
    const html = document.createElement('ul');
    this.main.data.quizzes[this.main.variables.gameType].rounds[
      this.main.variables.currentRoundId
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

    switch (this.main.variables.gameType) {
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

    image.src = this.main.getQuestionImageUrl(this.main.variables.currentQuestion.data.imageNum);
    this.main.variables.currentAnswerOptions.forEach((option, index) => {
      const answerOption = document.createElement('button');
      answerOption.dataset.id = index;
      answerOption.textContent = option.author;
      answerOption.addEventListener(
        'click',
        (event) => this.main.processAnswer(event.currentTarget.dataset.id),
        { once: true },
      );
      answerOptions.append(answerOption);
    });
    html.append(image);
    html.append(answerOptions);

    return html;
  }

  getQuestionPicturesPageContent() {
    this.main.app.layout.startLoader();
    const html = document.createElement('div');
    const h2 = document.createElement('h2');
    const questionPlaceholder = i18next.t(`Which picture was painted by {{author}}?`);
    h2.textContent = questionPlaceholder.replace(
      '{{author}}',
      this.main.variables.currentQuestion.data.author,
    );

    const answerOptions = document.createElement('div');
    answerOptions.className = 'answer-options pictures';

    this.main.variables.currentAnswerOptions.forEach((option, index) => {
      const imgSrc = this.main.getQuestionImageUrl(option.imageNum);
      this.main.app.layout.addLoadingItem(imgSrc);
      this.main.preloadImage(imgSrc, () => this.main.app.layout.removeLoadingItem(imgSrc));
      const answerOption = document.createElement('img');
      answerOption.dataset.id = index;
      answerOption.alt = option.name;
      answerOption.title = option.name;
      answerOption.src = this.main.getQuestionImageUrl(option.imageNum);
      answerOption.addEventListener(
        'click',
        (event) => this.main.processAnswer(event.currentTarget.dataset.id),
        { once: true },
      );
      answerOptions.append(answerOption);
    });
    html.append(h2);
    html.append(answerOptions);

    return html;
  }
}
