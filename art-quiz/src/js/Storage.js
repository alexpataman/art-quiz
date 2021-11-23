import config from './config';

export default class Storage {
  constructor() {
    this.prefix = config.localStoragePrefix;
  }

  computeFieldName(fieldName) {
    return this.prefix + fieldName;
  }

  set(fieldName, data) {
    localStorage.setItem(this.computeFieldName(fieldName), JSON.stringify(data));
  }

  get(fieldName) {
    return this.exists(fieldName)
      ? JSON.parse(localStorage.getItem(this.computeFieldName(fieldName)))
      : null;
  }

  exists(fieldName) {
    return !!localStorage.getItem(this.computeFieldName(fieldName));
  }

  clear() {
    Object.keys(localStorage).forEach((el) => {
      if (el.indexOf(this.prefix) === 0) {
        localStorage.removeItem(el);
      }
    });
  }
}
