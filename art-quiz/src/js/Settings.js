import { layout } from '../main';
//import _settingsHtml from '../views/_settings.html';

export default class Home {
  constructor() {
    this.init();
    //this.toggleSettings();
  }

  init() {
    this.setSelectors();
    this.setHandlers();
  }

  setSelectors() {
    this._htmlContainer = document.querySelector('.settings');
    this._htmlContent = this._htmlContainer.querySelector('.content');
    this._htmlToggleLink = this._htmlContainer.querySelector('.icon');
    this._htmlCloseLink = this._htmlContainer.querySelector('.close');
    this._htmlButtonSave = this._htmlContainer.querySelector('.save');
    this._htmlButtonReset = this._htmlContainer.querySelector('.reset');
  }

  toggleSettings() {
    this._htmlContent.classList.toggle('active');
  }

  saveSettings() {
    console.log('save settings');
    this.toggleSettings();
  }

  resetSettings() {
    console.log('reset settings');
  }

  setHandlers() {
    this._htmlToggleLink.addEventListener('click', () => this.toggleSettings());
    this._htmlCloseLink.addEventListener('click', () => this.toggleSettings());
    this._htmlButtonSave.addEventListener('click', () => this.saveSettings());
    this._htmlButtonReset.addEventListener('click', () => this.resetSettings());
  }
}
