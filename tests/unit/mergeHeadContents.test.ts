// FILEPATH: /Users/philipp/Projects/@swup/head-plugin/tests/unit/mergeHeadContents.test.ts

import { describe, expect, it } from 'vitest';
import mergeHeadContents from '../../src/mergeHeadContents.js';

const createHead = (contents: string = '') => {
    const html = `<head>${contents.trim()}</head>`;
    const { head } = new window.DOMParser().parseFromString(html, 'text/html');
    return head;
};

const mergeHeads = (current: string, incoming: string, options: Parameters<typeof mergeHeadContents>[2] = {}) => {
    const currentHead = createHead(current);
    const incomingHead = createHead(incoming);
    mergeHeadContents(currentHead, incomingHead, options);
    return currentHead;
};

describe('mergeHeadContents', () => {
    it('adds and removes tags from new head', () => {
        const head = mergeHeads(
            '<meta name="a" content="b">',
            '<meta name="b" content="c">'
        );
        expect(head.innerHTML).toMatchSnapshot();
    });

    it('keeps tags present in new head and current head', () => {
        const head = mergeHeads(
            '<link rel="next" content="/"><link rel="prev" content="/">',
            '<link rel="next" content="/">'
        );
        expect(head.innerHTML).toMatchSnapshot();
    });

    it('removes tags from current head not present in new head', () => {
        const head = mergeHeads(
            '<link rel="next" content="/"><link rel="prev" content="/">',
            '<link rel="next" content="/">'
        );
        expect(head.innerHTML).toMatchSnapshot();
    });

    it('keeps the right order of tags', () => {
        const head = mergeHeads(
            '<link rel="1"><link rel="2"><link rel="3"><link rel="4"><link rel="5">',
            '<link rel="5"><link rel="6"><link rel="2"><link rel="1">'
        );
        expect(head.innerHTML).toMatchSnapshot();
    });

    it('leaves title tags alone', () => {
        const head = mergeHeads(
            '<meta name="a" content="b">',
            '<meta name="a" content="b"><title>Title</title>'
        );
        expect(head.innerHTML).toMatchSnapshot();
    });

    it('does not remove persistent tags', () => {
        const head = mergeHeads(
            '<link rel="stylesheet"><link rel="prev">',
            '<meta name="a" content="b">',
            { shouldPersist: (el) => el.matches('[rel="stylesheet"]')}
        );
        expect(head.innerHTML).toMatchSnapshot();
    });

    it('returns the updated tags', () => {
        const head = createHead('<meta name="a"><meta name="b">');
        const incoming = createHead('<meta name="a"><meta name="c"><meta name="d">');
        const result = mergeHeadContents(head, incoming);
        expect(result.removed.length).toBe(1);
        expect(result.added.length).toBe(2);
        expect(result.removed[0].getAttribute('name')).toBe('b');
        expect(result.added[0].getAttribute('name')).toBe('c');
        expect(result.added[1].getAttribute('name')).toBe('d');
    });
});
