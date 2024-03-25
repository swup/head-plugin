import { vitest, describe, expect, it, beforeEach, afterEach } from 'vitest';
import Swup, { Visit } from 'swup';
import SwupHeadPlugin from '../../src/index.js';

vitest.mock('../../src/mergeHeadContents.js');
vitest.mock('../../src/updateLangAttribute.js');
vitest.mock('../../src/waitForAssets.js');

const page = { page: { html: '', url: '/' } };

describe('SwupHeadPlugin', () => {
    let swup: Swup;
    let plugin: SwupHeadPlugin;
    let visit: Visit;

    beforeEach(() => {
        swup = new Swup();
        plugin = new SwupHeadPlugin();
        // @ts-ignore - createVisit is marked internal
        visit = swup.createVisit({ url: '/' });
        visit.to.document = new window.DOMParser().parseFromString('<html><head></head><body></body></html>', 'text/html');
    });

    afterEach(() => {
        swup.unuse(plugin);
        swup.destroy();
    });

    it('calls updateHead before content:replace hook', async () => {
        const result: string[] = [];

        const spy = vitest.spyOn(plugin, 'updateHead').mockImplementation(() => result.push('plugin'));
        swup.use(plugin);

        swup.hooks.before('content:replace', () => result.push('before'));
        swup.hooks.on('content:replace', () => result.push('after'));
        await swup.hooks.call('content:replace', visit, page);

        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith(visit, page, undefined);
        expect(result).toStrictEqual(['plugin', 'before', 'after']);
    });

    it('merges heads from content:replace hook handler', async () => {
        const mergeHeadContents = await import('../../src/mergeHeadContents.js');
        mergeHeadContents.default = vitest.fn().mockImplementation(() => ({ removed: [], added: [] }));

        swup.use(plugin);
        plugin.updateHead(visit, page);
        expect(mergeHeadContents.default).toHaveBeenCalledOnce()
        expect(mergeHeadContents.default).toHaveBeenCalledWith(document.head, visit.to.document!.head, expect.anything())
    });

    it('updates lang attr from content:replace hook handler', async () => {
        const updateLangAttribute = await import('../../src/updateLangAttribute.js');
        updateLangAttribute.default = vitest.fn().mockImplementation(() => 'fr');

        swup.use(plugin);
        plugin.updateHead(visit, page);
        expect(updateLangAttribute.default).toHaveBeenCalledOnce()
        expect(updateLangAttribute.default).toHaveBeenCalledWith(document.documentElement, visit.to.document!.documentElement)
    });

    it('does not wait for assets by default', async () => {
        const waitForAssets = await import('../../src/waitForAssets.js');
        waitForAssets.default = vitest.fn().mockImplementation(() => ({ removed: [], added: [] }));

        swup.use(plugin);
        plugin.updateHead(visit, page);
        expect(waitForAssets.default).not.toHaveBeenCalled();
    });

    it('waits for assets if configured', async () => {
        const waitForAssets = await import('../../src/waitForAssets.js');
        waitForAssets.default = vitest.fn().mockImplementation(() => Promise.resolve());

        swup.use(plugin);
        plugin.options.awaitAssets = true;
        plugin.updateHead(visit, page);
        expect(waitForAssets.default).toHaveBeenCalledOnce();
    });
});
