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

function fetchBlob(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => URL.createObjectURL(blob));
}

async function download(url, name) {
  const a = document.createElement('a');
  a.href = await fetchBlob(url);
  a.download = name + url.slice(url.lastIndexOf('.'));
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export { timeout, createElement, download };
