import i18next from 'i18next';
import locI18next from 'loc-i18next';

class Translate {
  RESOURCES = {
    ru: {
      translation: {
        Settings: 'Настройки',
        Language: 'Язык',
        'Artist Quiz': 'Художники',
        'Pictures Quiz': 'Картины',
      },
    },
  };

  selectorAttr = 'data-i18n';

  init(language) {
    i18next.init({
      lng: language,
      debug: false,
      fallbackLng: false,
      returnEmptyString: false,
      resources: this.RESOURCES,
    });

    this.localize = locI18next.init(i18next, {
      selectorAttr: this.selectorAttr,
      parseDefaultValueFromContent: false,
    });

    this.applySettings();

    document.addEventListener('updateSettings', () => this.applySettings());
  }

  applySettings(language) {
    i18next.changeLanguage(language);
    this.localize('*');
  }
}

export default new Translate();
