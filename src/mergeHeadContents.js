import compareTags from './compareTags.js';

export default function mergeHeadContents(currentHead, newHead, { shouldPersist = () => false } = {}) {
	const themeActive = Boolean(document.querySelector('[data-swup-theme]'));

	const currentTags = Array.from(currentHead.children);
	const newChildren = Array.from(newHead.children);

	const addTags = getTagsToAdd(currentTags, newChildren, { themeActive });
	const removeTags = getTagsToRemove(currentTags, newChildren);

	// Remove tags in reverse to keep indexes, keep persistant elements
	removeTags.reverse()
		.filter(({ el }) => shouldManageTag(el))
		.filter(({ el }) => !shouldPersist(el))
		.forEach(({ el }) => currentHead.removeChild(el));

	// Insert tag *after* previous version of itself to preserve JS variable scope and CSS cascaade
	addTags
		.filter(({ el }) => shouldManageTag(el))
		.forEach(({ el, index }) => {
			currentHead.insertBefore(el, currentHead.children[index + 1] || null);
		});

	return {
		removed: removeTags.map(({ el }) => el),
		added: addTags.map(({ el }) => el),
	};
};

function getTagsToRemove(currentEls, newEls) {
	return currentEls.reduce((tags, el) => {
		const isAmongNew = newEls.some((newEl) => compareTags(el, newEl));
		const isThemeTag = el.matches('[data-swup-theme]');
		if (!isAmongNew && !isThemeTag) {
			tags.push({ el });
		}
		return tags;
	}, []);
};

function getTagsToAdd(currentEls, newEls, { themeActive }) {
	return newEls.reduce((tags, el, i) => {
		const isAmongCurrent = currentEls.some((currentEl) => compareTags(el, currentEl));
		if (!isAmongCurrent) {
			const index = themeActive ? i + 1 : i;
			tags.push({ el, index });
		}
		return tags;
	}, []);
};

function shouldManageTag(el) {
	return el.localName !== 'title'; // swup manages title itself
}
