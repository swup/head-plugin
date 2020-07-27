import Plugin from '@swup/plugin';

export default class HeadPlugin extends Plugin {
	name = 'HeadPlugin';

	mount() {
		this.swup.on('contentReplaced', this.getHeadAndReplace);
		this.swup.on('contentReplaced', this.updateHtmlLangAttribute);
	}

	unmount() {
		this.swup.off('contentReplaced', this.getHeadAndReplace);
		this.swup.off('contentReplaced', this.updateHtmlLangAttribute);
	}

	getHeadAndReplace = () => {
		const headChildren = this.getHeadChildren();
		const nextHeadChildren = this.getNextHeadChildren();

		this.replaceTags(headChildren, nextHeadChildren);
	};

	getHeadChildren = () => {
		return document.head.children;
	};

	getNextHeadChildren = () => {
		const pageContent = this.swup.cache
			.getCurrentPage()
			.originalContent.replace('<head', '<div id="swupHead"')
			.replace('</head>', '</div>');
		let element = document.createElement('div');
		element.innerHTML = pageContent;
		const children = element.querySelector('#swupHead').children;

		// cleanup
		element.innerHTML = '';
		element = null;

		return children;
	};

	replaceTags = (oldTags, newTags) => {
		const head = document.head;
		const themeActive = Boolean(document.querySelector('[data-swup-theme]'));
		const addTags = this.getTagsToAdd(oldTags, newTags, themeActive);
		const removeTags = this.getTagsToRemove(oldTags, newTags, themeActive);

		removeTags.reverse().forEach((item) => {
			head.removeChild(item.tag);
		});

		addTags.forEach((item) => {
			head.insertBefore(item.tag, head.children[item.index]);
		});

		this.swup.log(`Removed ${removeTags.length} / added ${addTags.length} tags in head`);
	};

	compareTags = (oldTag, newTag) => {
		const oldTagContent = oldTag.outerHTML;
		const newTagContent = newTag.outerHTML;

		return oldTagContent === newTagContent;
	};

	getTagsToRemove = (oldTags, newTags) => {
		const removeTags = [];

		for (let i = 0; i < oldTags.length; i++) {
			let foundAt = null;

			for (let j = 0; j < newTags.length; j++) {
				if (this.compareTags(oldTags[i], newTags[j])) {
					foundAt = j;
					break;
				}
			}

			if (foundAt == null && oldTags[i].getAttribute('data-swup-theme') === null) {
				removeTags.push({ tag: oldTags[i] });
			}
		}

		return removeTags;
	};

	getTagsToAdd = (oldTags, newTags, themeActive) => {
		const addTags = [];

		for (let i = 0; i < newTags.length; i++) {
			let foundAt = null;

			for (let j = 0; j < oldTags.length; j++) {
				if (this.compareTags(oldTags[j], newTags[i])) {
					foundAt = j;
					break;
				}
			}

			if (foundAt == null) {
				addTags.push({ index: themeActive ? i + 1 : i, tag: newTags[i] });
			}
		}

		return addTags;
	};

	updateHtmlLangAttribute = () => {
		const html = document.documentElement;

		const newPage = new DOMParser().parseFromString(
			this.swup.cache.getCurrentPage().originalContent,
			'text/html'
		);
		const newLang = newPage.documentElement.lang;

		if (html.lang !== newLang) {
			this.swup.log(`Updated lang attribute: ${html.lang} > ${newLang}`);
			html.lang = newLang;
		}
	};
}
