import { vitest, describe, expect, it, beforeEach, afterEach } from 'vitest';

import waitForStylesheet from '../../src/waitForStylesheet.js';

describe('waitForStylesheet', () => {
    let linkElement: HTMLLinkElement;

    beforeEach(() => {
        linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'http://example.com/style.css';
        document.head.appendChild(linkElement);
    });

    afterEach(() => {
        document.head.removeChild(linkElement);
    });

    it('resolves immediately if the stylesheet is already loaded', async () => {
        const mockCb = vitest.fn();
        await waitForStylesheet(linkElement);
        expect(mockCb).toHaveBeenCalled();
    });

    it('waits for the stylesheet to load if it is not already loaded', async () => {
        document.head.removeChild(linkElement);
        const mockCb = vitest.fn();
        setTimeout(() => document.head.appendChild(linkElement), 50);
        await waitForStylesheet(linkElement);
        expect(mockCb).toHaveBeenCalled();
    });

    it('resolves after a timeout if the stylesheet does not load', async () => {
        document.head.removeChild(linkElement);
        const mockCb = vitest.fn();
        await waitForStylesheet(linkElement, 100);
        expect(mockCb).toHaveBeenCalled();
    });
});
