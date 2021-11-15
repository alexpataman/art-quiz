function timeout(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function throttle() {}

function debounce() {}

export { timeout, throttle, debounce };
