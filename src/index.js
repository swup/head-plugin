import Plugin from '@swup/plugin';

export default class HeadPlugin extends Plugin {
	name = 'HeadPlugin';

	defaultOptions = {
		persistTags: false,
		persistAssets: false,
		awaitAssets: false
	};

	assetLoadPromises = [];

	constructor(options) {
		super();

		this.options = {
			...this.defaultOptions,
			...options
		};

		// options.persistAssets is a shortcut to:
		// options.persistTags with a default asset selector for scripts & styles
		if (this.options.persistAssets && !this.options.persistTags) {
			this.options.persistTags = 'link[rel=stylesheet], script[src], style';
		}
	}

	mount() {
		this.swup.on('contentReplaced', this.getHeadAndReplace);
		this.swup.on('contentReplaced', this.updateHtmlLangAttribute);
		if (this.options.awaitAssets) {
			this.originalSwupGetAnimationPromises = this.swup.getAnimationPromises;
			this.swup.getAnimationPromises = this.getDelayedAnimationPromises;
		}
	}

	unmount() {
		this.swup.off('contentReplaced', this.getHeadAndReplace);
		this.swup.off('contentReplaced', this.updateHtmlLangAttribute);
		if (this.options.awaitAssets) {
			this.swup.getAnimationPromises = this.originalSwupGetAnimationPromises;
			this.originalSwupGetAnimationPromises = null;
		}
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

		if (this.options.awaitAssets) {
			this.assetLoadPromises = this.getAssetLoadPromises(addTags);
		}

		removeTags.reverse().forEach((item) => {
			head.removeChild(item.tag);
		});

		addTags.forEach((item) => {
			// Insert tag *after* previous version of itself to preserve JS variable scope and CSS cascaade
			head.insertBefore(item.tag, head.children[item.index + 1] || null);
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

			if (foundAt == null && oldTags[i].getAttribute('data-swup-theme') === null && !this.isPersistentTag(oldTags[i])) {
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

	isPersistentTag = (item) => {
		const { persistTags } = this.options
		if (typeof persistTags === 'function') {
			return persistTags(item);
		}
		if (typeof persistTags === 'string') {
			return item.matches(persistTags);
		}
		return Boolean(persistTags);
	};

	getDelayedAnimationPromises = (type) => {
		const animationPromises = this.originalSwupGetAnimationPromises(type);
		if (type === 'in' && this.assetLoadPromises.length) {
			animationPromises.push(...this.assetLoadPromises);
		}
		return animationPromises;
	};

	getAssetLoadPromises = (tags) => {
		return tags.map((tag) => {
			if (tag.tagName === 'LINK') {
				return this.whenStylesheetLoaded(tag);
			}
		}).filter(Boolean);
	};

	whenStylesheetLoaded = (link) => {
		const whenLoaded = (cb) => {
			const { href } = link;
			const loadedStyleSheets = Array.from(document.styleSheets).map((ss) => ss.href);
			if (loadedStyleSheets.includes(href)) {
				cb();
			} else {
				setTimeout(() => whenLoaded(cb));
			}
		};

		return new Promise((resolve) => whenLoaded(resolve));
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
