import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import waitForAssets, { waitForStylesheet } from '../../src/waitForAssets.js';

describe('waitForAssets', () => {
	let stylesheet1: HTMLLinkElement;
	let stylesheet2: HTMLLinkElement;
	let stylesheet3: HTMLLinkElement;
	let stylesheets: HTMLLinkElement[];
	let script: HTMLScriptElement;
	let elements: Element[];

	beforeEach(() => {
		stylesheet1 = document.createElement('link');
		stylesheet1.rel = 'stylesheet';
		stylesheet1.href = 'https://example.net/screen.css';

		stylesheet2 = document.createElement('link');
		stylesheet2.rel = 'stylesheet';
		stylesheet2.href = 'https://example.net/print.css';

		stylesheet3 = document.createElement('link');
		stylesheet3.rel = 'stylesheet';

		script = document.createElement('script');
		script.src = 'https://example.net/script.js';

		stylesheets = [stylesheet1, stylesheet2, stylesheet3];
		elements = [...stylesheets, script];
	});

	it('returns an array of promises', async () => {
		const result = waitForAssets(elements);
		expect(result).toBeInstanceOf(Array);
		result.forEach((promise) => expect(promise).toBeInstanceOf(Promise));
	});

	it('only handles valid stylesheet elements', async () => {
		const result = waitForAssets(elements);
		expect(result).toHaveLength(2);

		// setTimeout(() => document.head.appendChild(stylesheet1), 50);
		// setTimeout(() => document.head.appendChild(stylesheet2), 50);

		// const awaitedAssets = await Promise.all(result);
		// expect(awaitedAssets).toContain(stylesheet1);
		// expect(awaitedAssets).toContain(stylesheet2);
		// expect(awaitedAssets).not.toContain(script);
	});
});

describe('waitForStylesheet', () => {
	let stylesheet: HTMLLinkElement;

	beforeEach(() => {
		stylesheet = document.createElement('link');
		stylesheet.rel = 'stylesheet';
		stylesheet.href = 'https://example.net/screen.css';
	});

	it('waits for stylesheet to load', async () => {
		let started: number = Date.now();
		let loaded: number = 0;
		let awaited: number = 0;

		stylesheet.onload = () => (loaded = Date.now());
		setTimeout(() => document.head.appendChild(stylesheet), 300);

		await waitForStylesheet(stylesheet);
		awaited = Date.now();

		expect(loaded).toBeGreaterThan(started);
		expect(awaited).toBeGreaterThanOrEqual(0);
		expect(awaited).toBeGreaterThanOrEqual(loaded);
		expect(awaited - started).toBeGreaterThan(300);
		expect(awaited - started).toBeLessThan(400);
	});

	it('resolves after a timeout', async () => {
		const started = Date.now();
		await waitForStylesheet(stylesheet, 500);
		const awaited = Date.now();

		expect(awaited - started).toBeGreaterThan(400);
		expect(awaited - started).toBeLessThan(600);
	});
});
