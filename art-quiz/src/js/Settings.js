class Settings {
  init() {
    this.setSelectors();
    this.setHandlers();
  }

  setSelectors() {
    this.htmlContainer = document.querySelector('.settings');
    this.htmlContent = this.htmlContainer.querySelector('.content');
    this.htmlToggleLink = this.htmlContainer.querySelector('.icon');
    this.htmlCloseLink = this.htmlContainer.querySelector('.close');
    this.htmlButtonSave = this.htmlContainer.querySelector('.save');
    this.htmlButtonReset = this.htmlContainer.querySelector('.reset');
  }

  toggleSettings() {
    this.htmlContent.classList.toggle('active');
  }

  saveSettings() {
    // console.log('save settings');
    this.toggleSettings();
  }

  static resetSettings() {
    delete localStorage.gameData;
    // alert('Done. The page will be reloaded');
    window.location.reload();
  }

  setHandlers() {
    this.htmlToggleLink.addEventListener('click', () => this.toggleSettings());
    this.htmlCloseLink.addEventListener('click', () => this.toggleSettings());
    this.htmlButtonSave.addEventListener('click', () => this.saveSettings());
    this.htmlButtonReset.addEventListener('click', () => {
      Settings.resetSettings();
    });
  }
}

export default new Settings();
