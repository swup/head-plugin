import Plugin from '@swup/plugin';

import mergeHeadContents from './mergeHeadContents.js';
import updateLangAttribute from './updateLangAttribute.js';
import waitForAssets from './waitForAssets.js';

export default class HeadPlugin extends Plugin {
	name = 'HeadPlugin';

	assetLoadPromises = [];

	constructor(options = {}) {
		super();

		this.options = {
			persistTags: false,
			persistAssets: false,
			awaitAssets: false,
			timeout: 3000,
			...options
		};

		this.validateOptions();
	}

	validateOptions() {
		// options.persistAssets is a shortcut for:
		// options.persistTags with a default asset selector for scripts & styles
		if (this.options.persistAssets && !this.options.persistTags) {
			this.options.persistTags = 'link[rel=stylesheet], script[src], style';
		}

		// Make sure the swup version in use supports hooking into `replaceContent`
		if (this.options.awaitAssets && !this.swup.replaceContent) {
			this.options.awaitAssets = false;
			console.error('[Swup Head Plugin] Installed version of swup doesn\'t support awaitAssets option');
		}
	}

	mount() {
		// Replace head contents right before content itself
		this.swup.on('willReplaceContent', this.updateHead);

		// Overwrite swup's replaceContent to let us defer until all assets are loaded
		if (this.options.awaitAssets) {
			this.originalSwupReplaceContent = this.swup.replaceContent.bind(this.swup);
			this.swup.replaceContent = this.replaceContentAfterAssetsLoaded.bind(this);
		}
	}

	unmount() {
		this.swup.off('willReplaceContent', this.updateHead);

		if (this.originalSwupReplaceContent) {
			this.swup.replaceContent = this.originalSwupReplaceContent;
			this.originalSwupReplaceContent = null;
		}
	}

	updateHead = () => {
		const newPageHtml = this.swup.cache.getCurrentPage().originalContent;
		let newDocument = new DOMParser().parseFromString(newPageHtml, 'text/html');

		const { removed, added } = mergeHeadContents(document.head, newDocument.head, { shouldPersist: this.isPersistentTag });
		const lang = updateLangAttribute(document.documentElement, newDocument.documentElement);

		this.swup.log(`Removed ${removed.length} / added ${added.length} tags in head`);
		if (lang) {
			this.swup.log(`Updated lang attribute: ${lang}`);
		}

		if (this.options.awaitAssets) {
			this.assetLoadPromises = waitForAssets(added);
		} else {
			this.assetLoadPromises = [];
		}

		newDocument.documentElement.innerHTML = '';
		newDocument = null;
	};

	replaceContentAfterAssetsLoaded(...originalArgs) {
		return new Promise((resolve) => {
			Promise.all(this.assetLoadPromises).then(() => {
				this.assetLoadPromises = [];
				this.originalSwupReplaceContent(...originalArgs).then(resolve);
			});
		});
	}

	isPersistentTag = (el) => {
		const { persistTags } = this.options;
		if (typeof persistTags === 'function') {
			return persistTags(el);
		}
		if (typeof persistTags === 'string') {
			return el.matches(persistTags);
		}
		return Boolean(persistTags);
	};
}
