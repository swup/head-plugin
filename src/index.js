import Plugin from '@swup/plugin';

import mergeHeadContents from './mergeHeadContents.js';
import updateLangAttribute from './updateLangAttribute.js';
import waitForAssets from './waitForAssets.js';

export default class SwupHeadPlugin extends Plugin {
	name = 'SwupHeadPlugin';

	defaults = {
		persistTags: false,
		persistAssets: false,
		awaitAssets: false,
		timeout: 3000
	};

	assetLoadPromises = [];

	constructor(options = {}) {
		super();

		this.options = { ...this.defaults, ...options };

		// persistAssets is a shortcut for: persistTags with a default asset selector for scripts & styles
		if (this.options.persistAssets && !this.options.persistTags) {
			this.options.persistTags = 'link[rel=stylesheet], script[src], style';
		}
	}

	mount() {
		this.swup.hooks.before('replaceContent', this.updateHead);
	}

	unmount() {
		this.swup.hooks.off('replaceContent', this.updateHead);

		if (this.originalSwupReplaceContent) {
			this.swup.replaceContent = this.originalSwupReplaceContent;
			this.originalSwupReplaceContent = null;
		}
	}

	updateHead = async (context, { page: { html } }) => {
		const newDocument = new DOMParser().parseFromString(html, 'text/html');

		const { removed, added } = mergeHeadContents(document.head, newDocument.head, { shouldPersist: this.isPersistentTag });
		this.swup.log(`Removed ${removed.length} / added ${added.length} tags in head`);

		const lang = updateLangAttribute(document.documentElement, newDocument.documentElement);
		if (lang) {
			this.swup.log(`Updated lang attribute: ${lang}`);
		}

		if (this.options.awaitAssets) {
			const assetLoadPromises = waitForAssets(added, this.options.timeout);
			if (this.assetLoadPromises.length) {
				this.swup.log(`Waiting for ${this.assetLoadPromises.length} assets to load`);
				await Promise.all(assetLoadPromises);
			}
		}
	};

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
