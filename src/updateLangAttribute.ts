export default function updateLangAttribute(
	currentHtml: HTMLElement,
	newHtml: HTMLElement
): string | null {
	if (currentHtml.lang !== newHtml.lang) {
		currentHtml.lang = newHtml.lang;
		return currentHtml.lang;
	} else {
		return null;
	}
}
