/**
 * Vitest config file
 * @see https://vitest.dev/config/
 */

import { defineConfig } from 'vitest/config';

const browser = false;

export default defineConfig({
	test: {
		environment: 'jsdom',
		environmentOptions: {
			jsdom: {
				console: true,
				resources: 'usable'
			}
		},
		include: ['tests/unit/**/*.test.ts'],
		setupFiles: ['tests/config/vitest.setup.ts'],
		testTimeout: 1000,
		browser: browser ? {
			enabled: true,
			headless: true,
			provider: 'playwright',
			name: 'chromium',
		} : undefined,
	},
});
