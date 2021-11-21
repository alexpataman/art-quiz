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
        'Sound Effects': 'Звуковые эффекты',
        On: 'Вкл',
        Off: 'Выкл',
        Music: 'Музыка',
        'Time Game': 'Игра на время',
        'Data Reset': 'Сброс данных',
        'Volume of sound effects': 'Громкость звуковых эффектов',
        'Volume of music': 'Громкость музыки',
        'Time to answer': 'Время на ответ',
        'All data and game progress will be reset': 'Все данные и игровой прогресс будут сброшены',
        'Clear All Data': 'Очистить данные',
        Default: 'Сбросить',
        Close: 'Закрыть',
        'Which picture did {{author}} paint?': 'Какую картину нарисовал {{author}}?',
        'Play Again': 'Ещё раз',
        Score: 'Результаты',
        Next: 'Продолжить',
        'Good luck next time!': 'Удачи в следующий раз!',
        'Congratulations!': 'Неплохо!',
        'Grand result': 'Отлично',
        Home: 'Главная',
        'Next Quiz': 'Далее',
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
