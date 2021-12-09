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

async function fetchBlob(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

async function download(url, name) {
  const link = document.createElement('a');
  link.href = await fetchBlob(url);
  link.download = name + url.slice(url.lastIndexOf('.'));
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export { timeout, createElement, download };
