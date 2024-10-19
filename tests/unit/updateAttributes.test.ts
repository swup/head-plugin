import { describe, expect, it } from 'vitest';
import updateAttributes from '../../src/updateAttributes.js';

function createElement(html: string): Element {
	const el = document.createElement('div');
	el.innerHTML = html;
	return el.firstElementChild!;
};

const mergeAttributes = (currentEl: string, incomingEl: string, ...args): string => {
	const current = createElement(currentEl);
	const incoming = createElement(incomingEl);
	updateAttributes(current, incoming, ...args);
	return current.outerHTML;
};

describe('updateAttributes', () => {
	describe('attributes', () => {
		it('adds attributes', () => {
			expect(mergeAttributes('<div></div>', '<div a="b"></div>')).toBe('<div a="b"></div>');
			expect(mergeAttributes('<div></div>', '<div a="b" b="c"></div>')).toBe('<div a="b" b="c"></div>');
		});

		it('updates attributes', () => {
			expect(mergeAttributes('<div a="b" b="c"></div>', '<div a="c" b="c"></div>')).toBe('<div a="c" b="c"></div>');
		});

		it('removes attributes', () => {
			expect(mergeAttributes('<div a="b"></div>', '<div></div>')).toBe('<div></div>');
			expect(mergeAttributes('<div a="b" b="c"></div>', '<div a="b"></div>')).toBe('<div a="b"></div>');
		});

		it('allows filtering attributes', () => {
			expect(mergeAttributes('<div></div>', '<div a="b"></div>', [''])).toBe('<div></div>');
			expect(mergeAttributes('<div></div>', '<div a="b"></div>', ['b'])).toBe('<div></div>');
			expect(mergeAttributes('<div></div>', '<div b="c"></div>', ['a'])).toBe('<div></div>');
			expect(mergeAttributes('<div></div>', '<div a="b" b="c"></div>', ['a'])).toBe('<div a="b"></div>');
			expect(mergeAttributes('<div></div>', '<div a="b" b="c"></div>', ['b'])).toBe('<div b="c"></div>');
			expect(mergeAttributes('<div></div>', '<div a="b" b="c"></div>', ['a', 'b'])).toBe('<div a="b" b="c"></div>');
			expect(mergeAttributes('<div></div>', '<div a="b" abc="d" bcd="e"></div>', [/^ab/])).toBe('<div abc="d"></div>');
		});

		it('handles boolean attributes', () => {
			expect(mergeAttributes('<div disabled></div>', '<div hidden></div>')).toBe('<div hidden=""></div>');
			expect(mergeAttributes('<div></div>', '<div disabled></div>')).toBe('<div disabled=""></div>');
		});
	});

	describe('types', () => {
		const el = document.createElement('div');

		it('returns nothing', () => {
			expect(updateAttributes(el, el)).toBeUndefined();
		});

		it('only accepts elements', () => {
			try {
				updateAttributes(el, el);
				// @ts-expect-error
				updateAttributes('', el);
				// @ts-expect-error
				updateAttributes(el, '');
				// @ts-expect-error
				updateAttributes(el, 1);
				// @ts-expect-error
				updateAttributes(el, []);
				// @ts-expect-error
				updateAttributes(el);
			} catch (error) {}
		});
	});
});
