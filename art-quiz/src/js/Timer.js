import layout from './layout';
import * as utils from './utils';

export default class Timer {
  constructor(game) {
    this.game = game;
    document.addEventListener('changeTimeLimitedGameSetting', () => this.verifySettings());
  }

  init() {
    if (!this.game.settings.data.timeLimitedGame) {
      return;
    }

    this.settings = {
      FULL_DASH_ARRAY: 283,
      TIME_LIMIT: this.game.settings.data.timeLimit,
      WARNING_THRESHOLD: this.game.settings.data.timeLimit * 0.6,
      ALERT_THRESHOLD: this.game.settings.data.timeLimit * 0.3,
    };

    this.COLOR_CODES = {
      info: {
        color: 'green',
      },
      warning: {
        color: 'orange',
        threshold: this.settings.WARNING_THRESHOLD,
      },
      alert: {
        color: 'red',
        threshold: this.settings.ALERT_THRESHOLD,
      },
    };

    this.game.variables.timer.stop();
    this.container = Timer.getContainer();
    layout.main.append(this.container);
    this.timePassed = 0;
    this.timeLeft = this.settings.TIME_LIMIT;
    this.timerInterval = null;
    this.remainingPathColor = this.COLOR_CODES.info.color;
    this.setContent();
    this.timerInterval = setInterval(() => {
      this.timePassed += 1;
      this.timeLeft = this.settings.TIME_LIMIT - this.timePassed;
      this.container.querySelector('#base-timer-label').innerHTML = Timer.formatTime(this.timeLeft);
      this.setCircleDasharray();
      this.setRemainingPathColor(this.timeLeft);

      if (this.timeLeft === 0) {
        this.onTimesUp();
      }
    }, 1000);
  }

  static getContainer() {
    return utils.createElement('div', 'timer');
  }

  setContent() {
    this.container.innerHTML = `
    <div class="base-timer">
      <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="base-timer__circle">
          <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer__path-remaining ${this.remainingPathColor}"
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          ></path>
        </g>
      </svg>
      <span id="base-timer-label" class="base-timer__label">${Timer.formatTime(
        this.timeLeft,
      )}</span>
    </div>`;
  }

  onTimesUp() {
    this.stop();
    if (layout.body.classList.contains('question')) {
      this.game.processAnswer();
    }
  }

  verifySettings() {
    if (!this.game.settings.data.timeLimitedGame) {
      this.destroy();
    } else {
      this.init();
    }
  }

  stop() {
    clearInterval(this.timerInterval);
  }

  destroy() {
    this.stop();
    if (this.container) {
      this.container.remove();
    }
  }

  static formatTime(time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }

  setRemainingPathColor(timeLeft) {
    const { alert, warning, info } = this.COLOR_CODES;
    if (timeLeft <= alert.threshold) {
      this.container.querySelector('#base-timer-path-remaining').classList.remove(warning.color);
      this.container.querySelector('#base-timer-path-remaining').classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
      this.container.querySelector('#base-timer-path-remaining').classList.remove(info.color);
      this.container.querySelector('#base-timer-path-remaining').classList.add(warning.color);
    }
  }

  calculateTimeFraction() {
    const rawTimeFraction = this.timeLeft / this.settings.TIME_LIMIT;
    return rawTimeFraction - (1 / this.settings.TIME_LIMIT) * (1 - rawTimeFraction);
  }

  setCircleDasharray() {
    const circleDasharray = `${(
      this.calculateTimeFraction() * this.settings.FULL_DASH_ARRAY
    ).toFixed(0)} 283`;
    this.container
      .querySelector('#base-timer-path-remaining')
      .setAttribute('stroke-dasharray', circleDasharray);
  }
}