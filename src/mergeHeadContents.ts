type ElementCollection = { el: Element; index?: number }[];

export default function mergeHeadContents(
	currentHead: HTMLHeadElement,
	newHead: HTMLHeadElement,
	{ shouldPersist = () => false }: { shouldPersist?: (el: Element) => boolean } = {}
) {
	const currentTags = Array.from(currentHead.children);
	const newChildren = Array.from(newHead.children);

	const addTags = getTagsToAdd(currentTags, newChildren);
	const removeTags = getTagsToRemove(currentTags, newChildren);

	// Remove tags in reverse to keep indexes, keep persistant elements
	removeTags
		.reverse()
		.filter(({ el }) => shouldManageTag(el))
		.filter(({ el }) => !shouldPersist(el))
		.forEach(({ el }) => currentHead.removeChild(el));

	// Insert tag *after* previous version of itself to preserve JS variable scope and CSS cascade
	addTags
		.filter(({ el }) => shouldManageTag(el))
		.forEach(({ el, index = 0 }) => {
			currentHead.insertBefore(el.cloneNode(true), currentHead.children[index + 1] || null);
		});

	return {
		removed: removeTags.map(({ el }) => el),
		added: addTags.map(({ el }) => el)
	};
}

function getTagsToRemove(currentEls: Element[], newEls: Element[]): ElementCollection {
	return currentEls.reduce((tags, el) => {
		const isAmongNew = newEls.some((newEl) => compareTags(el, newEl));
		if (!isAmongNew) {
			tags.push({ el });
		}
		return tags;
	}, [] as ElementCollection);
}

function getTagsToAdd(currentEls: Element[], newEls: Element[]): ElementCollection {
	return newEls.reduce((tags, el, index) => {
		const isAmongCurrent = currentEls.some((currentEl) => compareTags(el, currentEl));
		if (!isAmongCurrent) {
			tags.push({ el, index });
		}
		return tags;
	}, [] as ElementCollection);
}

function shouldManageTag(el: Element) {
	// Let swup manage the title tag
	if (el.localName === 'title') {
		return false;
	}
	// Leave swup theme styles untouched
	if (el.matches('[data-swup-theme]')) {
		return false;
	}
	return true;
}

function compareTags(oldTag: Element, newTag: Element) {
	return oldTag.outerHTML === newTag.outerHTML;
}
