import waitForStylesheet from './waitForStylesheet.js';

export default function waitForAssets(elements, timeoutMs = 0) {
  return elements
    .filter((el) => el.localName === 'link')
    .map((el) => waitForStylesheet(el, timeoutMs));
};
