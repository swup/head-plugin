import { vitest, describe, expect, it, beforeEach, afterEach } from 'vitest';

import Swup, { Visit } from 'swup';
import SwupHeadPlugin from '../../src/index.js';

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
        const payload = { page: { html: '', url: '/' } };

        const spy = vitest.spyOn(plugin, 'updateHead').mockImplementation(() => result.push('plugin'));
        swup.use(plugin);

        swup.hooks.before('content:replace', () => result.push('before'));
        swup.hooks.on('content:replace', () => result.push('after'));
        await swup.hooks.call('content:replace', visit, payload);

        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith(visit, payload, undefined);
        expect(result).toStrictEqual(['plugin', 'before', 'after']);
    });
});
