import { describe, expect, it } from 'vitest';
import updateLangAttribute from '../../src/updateLangAttribute.js';

describe('updateLangAttribute', () => {
	it('updates the lang attribute when different', () => {
			const currentHtml = document.createElement('html');
			const newHtml = document.createElement('html');
			currentHtml.lang = 'en';
			newHtml.lang = 'fr';

			const result = updateLangAttribute(currentHtml, newHtml);
			expect(result).toBe('fr');
			expect(currentHtml.lang).toBe('fr');
	});

	it('does not update the lang attribute when identical', () => {
			const currentHtml = document.createElement('html');
			const newHtml = document.createElement('html');
			currentHtml.lang = 'en';
			newHtml.lang = 'en';

			const result = updateLangAttribute(currentHtml, newHtml);
			expect(result).toBeNull();
			expect(currentHtml.lang).toBe('en');
	});

	it('updates the lang attribute when current page has none', () => {
			const currentHtml = document.createElement('html');
			const newHtml = document.createElement('html');
			newHtml.lang = 'fr';

			const result = updateLangAttribute(currentHtml, newHtml);
			expect(result).toBe('fr');
			expect(currentHtml.lang).toBe('fr');
	});

	it('updates the lang attribute when new page has none', () => {
			const currentHtml = document.createElement('html');
			const newHtml = document.createElement('html');
			currentHtml.lang = 'fr';

			const result = updateLangAttribute(currentHtml, newHtml);
			expect(result).toBeNull();
			expect(currentHtml.lang).toBe('');
	});
});
