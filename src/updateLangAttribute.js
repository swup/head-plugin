export default function updateLangAttribute(currentHtml, newHtml) {
	if (currentHtml.lang !== newHtml.lang) {
		currentHtml.lang = newHtml.lang;
		return currentHtml.lang;
	} else {
		return null;
	}
};
