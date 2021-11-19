import storage from './storage';
import sounds from './sounds';
import translate from './translate';

export default class Settings {
  static DEFAULT_VALUES = {
    enableSoundEffects: false,
    effectsVolumeLevel: sounds.getDefaultValue('defaultEffectsVolume'),
    enableMusic: false,
    musicVolumeLevel: sounds.getDefaultValue('defaultMusicVolume'),
    timeLimit: '10',
    timeLimitedGame: false,
    language: 'en',
  };

  constructor() {
    this.data = Settings.getSettings();
  }

  init() {
    translate.init(this.data.language);
    this.setSelectors();
    this.setHandlers();
    this.adjustDependentSections();
  }

  adjustDependentSections() {
    this.form.querySelectorAll('.dependent').forEach((el) => {
      if (!this.data[el.dataset.dependentOn]) {
        el.classList.remove('visible');
      } else {
        el.classList.add('visible');
      }
    });
  }

  setSelectors() {
    this.htmlContainer = document.querySelector('.settings');
    this.htmlContent = this.htmlContainer.querySelector('.content');
    this.htmlToggleLink = document.querySelector('.settings-icon');
    this.htmlCloseLink = this.htmlContainer.querySelector('.close');
    this.htmlButtonClose = this.htmlContainer.querySelector('.save');
    this.htmlButtonReset = this.htmlContainer.querySelector('.reset');
    this.htmlButtonClearStorage = this.htmlContainer.querySelector('.clear-storage');
    this.form = this.htmlContainer.querySelector('form');
  }

  toggleSettings() {
    this.htmlContent.classList.toggle('active');
  }

  resetSettings() {
    this.data = Settings.DEFAULT_VALUES;
    this.setFormData();
  }

  handleFormChange(event) {
    this.data = Object.fromEntries(new FormData(this.form).entries());

    if (event.target.name === 'language') {
      translate.applySettings(event.target.value);
      document.dispatchEvent(new Event('changeLanguage'));
    }

    if (event.target.name === 'timeLimitedGame') {
      document.dispatchEvent(new Event('changeTimeLimitedGameSetting'));
    }

    if (event.target.name === 'enableMusic') {
      if (!event.target.checked) {
        sounds.stopMusic();
      } else {
        sounds.playMusic();
      }
    }

    if (event.target.name === 'effectsVolumeLevel') {
      sounds.setVolume('effects', event.target.value);
      sounds.playEffect('answerCorrect');
    }

    if (event.target.name === 'musicVolumeLevel') {
      sounds.setVolume('music', event.target.value);
    }

    this.saveSettings();
    this.adjustDependentSections();
  }

  saveSettings() {
    storage.set('settings', this.data);
    document.dispatchEvent(new Event('updateSettings'));
  }

  static getSettings() {
    return storage.exists('settings') ? storage.get('settings') : Settings.DEFAULT_VALUES;
  }

  static clearStorage() {
    storage.clear();
    setTimeout(() => {
      window.location.reload();
    });
  }

  setFormData() {
    const elements = this.form.querySelectorAll('input');
    elements.forEach((el, index) => {
      switch (el.type) {
        case 'checkbox':
          elements[index].checked = !!this.data[el.name] === !!el.value;
          break;
        case 'radio':
          elements[index].checked = this.data[el.name] === el.value;
          break;
        default:
          elements[index].value = this.data[el.name];
      }
    });
  }

  setHandlers() {
    this.htmlToggleLink.addEventListener('click', () => this.toggleSettings());
    this.htmlCloseLink.addEventListener('click', () => this.toggleSettings());
    this.htmlButtonClose.addEventListener('click', () => this.toggleSettings());
    this.htmlButtonClearStorage.addEventListener('click', () => Settings.clearStorage());
    this.form.addEventListener('change', (event) => this.handleFormChange(event));
    document.addEventListener('DOMContentLoaded', () => this.setFormData());
    this.htmlButtonReset.addEventListener('click', () => {
      this.resetSettings();
    });
  }
}
