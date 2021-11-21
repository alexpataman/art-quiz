import config from './config';

export default class Storage {
  constructor() {
    this.prefix = config.localStoragePrefix;
  }

  computeFieldName(fieldName) {
    return this.prefix + fieldName;
  }

  set(fieldName, data) {
    localStorage[this.computeFieldName(fieldName)] = JSON.stringify(data);
  }

  get(fieldName) {
    return localStorage[this.computeFieldName(fieldName)]
      ? JSON.parse(localStorage[this.computeFieldName(fieldName)])
      : null;
  }

  exists(fieldName) {
    return !!localStorage[this.computeFieldName(fieldName)];
  }

  clear() {
    Object.keys(localStorage).forEach((el) => {
      if (el.indexOf(this.prefix) === 0) {
        delete localStorage[el];
      }
    });
  }
}
