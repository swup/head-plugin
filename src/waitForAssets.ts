import waitForStylesheet from './waitForStylesheet.js';

function isStylesheet(el: Element): el is HTMLLinkElement {
	return el.matches('link[rel=stylesheet][href]');
}

export default function waitForAssets(elements: Element[], timeoutMs: number = 0) {
	return elements.filter(isStylesheet).map((el) => waitForStylesheet(el, timeoutMs));
}
