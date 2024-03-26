import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'

/**
 * Mock server
 */

const files = {
  'screen.css': 'body { color: red; }',
  'print.css': 'body { color: blue; }',
  'script.js': 'console.log("Hello, world!");',
};

const fileHandler = http.get('https://example.net/:file', ({ params }) => {
  const file = params.file as string;
  const contentType = file.endsWith('.css') ? 'text/css' : 'application/javascript';
  return HttpResponse.text(files[file] ?? '', { headers: { 'Content-Type': contentType } });
});

const server = setupServer(fileHandler)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
