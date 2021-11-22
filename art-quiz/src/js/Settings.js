import Layout from './Layout';

export default class Settings {
  constructor(app) {
    this.app = app;

    this.DEFAULT_VALUES = {
      enableSoundEffects: true,
      effectsVolumeLevel: this.app.sounds.getDefaultValue('defaultEffectsVolume'),
      enableMusic: false,
      musicVolumeLevel: this.app.sounds.getDefaultValue('defaultMusicVolume'),
      timeLimit: '15',
      timeLimitedGame: true,
      language: 'ru',
    };

    this.data = this.getSettings();
  }

  init() {
    this.app.translations.init(this.data.language);
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
    this.fixBodyHandler();
  }

  fixBodyHandler() {
    if (this.htmlContent.classList.contains('active')) {
      Layout.fixBody();
    } else {
      Layout.unfixBody();
    }
  }

  resetSettings() {
    this.setFormData(this.DEFAULT_VALUES);
  }

  handleFormChange(event) {
    this.data = Object.fromEntries(new FormData(this.form).entries());

    if (event.target.name === 'language') {
      this.app.translations.applySettings(event.target.value);
      document.dispatchEvent(new Event('changeLanguage'));
    }

    if (event.target.name === 'timeLimitedGame') {
      document.dispatchEvent(new Event('changeTimeLimitedGameSetting'));
    }

    if (event.target.name === 'enableMusic') {
      if (!event.target.checked) {
        this.app.sounds.stopMusic();
      } else if (event.isTrusted) {
        this.app.sounds.playMusic();
      }
    }

    if (event.target.name === 'effectsVolumeLevel') {
      this.app.sounds.setVolume('effects', event.target.value);
      if (event.isTrusted) {
        this.app.sounds.playEffect('answerCorrect');
      }
    }

    if (event.target.name === 'musicVolumeLevel') {
      this.app.sounds.setVolume('music', event.target.value);
    }

    this.saveSettings();
    this.adjustDependentSections();
  }

  saveSettings() {
    this.app.storage.set('settings', this.data);
    document.dispatchEvent(new Event('updateSettings'));
  }

  getSettings() {
    return this.app.storage.exists('settings')
      ? this.app.storage.get('settings')
      : this.DEFAULT_VALUES;
  }

  clearStorage() {
    this.app.storage.clear();
    setTimeout(() => {
      window.location.reload();
    });
  }

  setFormData(data) {
    const elements = this.form.querySelectorAll('input');
    const elementsDispatchChangeEvents = [];
    elements.forEach((el, index) => {
      switch (el.type) {
        case 'checkbox':
          if (!!data[el.name] !== !!el.checked) {
            elements[index].checked = !!data[el.name] === !!el.value;
            elementsDispatchChangeEvents.push(el);
          }
          break;
        case 'radio':
          if (!elements[index].checked && data[el.name] === el.value) {
            elements[index].checked = true;
            elementsDispatchChangeEvents.push(el);
          }
          break;
        default:
          if (elements[index].value !== data[el.name]) {
            elements[index].value = data[el.name];
            elementsDispatchChangeEvents.push(el);
          }
      }
    });

    elementsDispatchChangeEvents.forEach((el) => {
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  setHandlers() {
    this.htmlToggleLink.addEventListener('click', () => this.toggleSettings());
    this.htmlCloseLink.addEventListener('click', () => this.toggleSettings());
    this.htmlButtonClose.addEventListener('click', () => this.toggleSettings());
    this.htmlButtonClearStorage.addEventListener('click', () => this.clearStorage());
    this.form.addEventListener('change', (event) => this.handleFormChange(event));
    document.addEventListener('DOMContentLoaded', () => this.setFormData(this.data));
    this.htmlButtonReset.addEventListener('click', () => {
      this.resetSettings();
    });
  }
}
