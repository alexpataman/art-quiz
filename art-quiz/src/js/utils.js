function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function createElement(tagName, className, content) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (content) {
    element.append(content);
  }
  return element;
}

function throttle() {}

function debounce() {}

export { timeout, throttle, debounce, createElement };
