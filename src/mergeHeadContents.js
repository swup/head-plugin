import compareTags from './compareTags.js';

export default function mergeHeadContents(currentHead, newHead, { shouldPersist = () => false } = {}) {
	const themeActive = Boolean(document.querySelector('[data-swup-theme]'));
	const addTags = getTagsToAdd(currentHead.children, newHead.children, { themeActive });
	const removeTags = getTagsToRemove(currentHead.children, newHead.children);

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

function getTagsToRemove(currentTags, newTags) {
	const removeTags = [];

	for (let i = 0; i < currentTags.length; i++) {
		let foundAt = null;

		for (let j = 0; j < newTags.length; j++) {
			if (compareTags(currentTags[i], newTags[j])) {
				foundAt = j;
				break;
			}
		}

		if (foundAt == null && currentTags[i].getAttribute('data-swup-theme') === null) {
			removeTags.push({ el: currentTags[i] });
		}
	}

	return removeTags;
};

function getTagsToAdd(currentTags, newTags, { themeActive }) {
	const addTags = [];

	for (let i = 0; i < newTags.length; i++) {
		let foundAt = null;

		for (let j = 0; j < currentTags.length; j++) {
			if (compareTags(currentTags[j], newTags[i])) {
				foundAt = j;
				break;
			}
		}

		if (foundAt == null) {
			addTags.push({ el: newTags[i], index: themeActive ? i + 1 : i });
		}
	}

	return addTags;
};

function shouldManageTag(el) {
	return el.localName !== 'title'; // swup manages title itself
}
