import { jest } from '@jest/globals';
import { apiFetch } from '../lib/apiFetch/fetch.js';

let consoleErrorSpy;

beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
});

test('apiFetch returns json for successful response', async () => {
  const expected = { ok: true };
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => expected,
  });

  const result = await apiFetch('/api/test');
  expect(result).toEqual(expected);
});

test('apiFetch returns empty object for 204', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 204,
    json: async () => ({ shouldNot: 'happen' }),
  });

  const result = await apiFetch('/api/test');
  expect(result).toEqual({});
});

test('apiFetch returns parsed error body when response is not ok', async () => {
  const errBody = { message: 'bad request' };
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    json: async () => errBody,
  });

  const result = await apiFetch('/api/test');
  expect(result).toEqual(errBody);
  expect(consoleErrorSpy).toHaveBeenCalledWith('API Fetch failed: 400 Bad Request');
});
