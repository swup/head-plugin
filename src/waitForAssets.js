import loadStylesheet from './loadStylesheet.js';

function isStylesheet(element) {
  return element.matches('link[rel=stylesheet][href]');
}

function isScript(element) {
  return element.matches('script');
}

export default function waitForAssets(elements, timeoutMs = 0) {
  const stylesheets = elements.filter((el) => isStylesheet(el));
  const scripts = elements.filter((el) => isScript(el));
  return stylesheets.map((el) => loadStylesheet(el, timeoutMs));
};
