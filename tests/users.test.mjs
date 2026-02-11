import { jest } from '@jest/globals';
import { loadFresh } from './helpers/load-module.mjs';

beforeEach(() => {
  jest.resetModules();
});

test('getOrCreateUserFromSession returns unauthorized response when no session', async () => {
  const queryMock = jest.fn();
  const getSessionMock = jest.fn().mockResolvedValue(null);

  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));
  jest.unstable_mockModule('@/lib/auth0', () => ({ auth0: { getSession: getSessionMock } }));

  const { getOrCreateUserFromSession } = await loadFresh('lib/users.js');
  const result = await getOrCreateUserFromSession();

  expect(result.status).toBe(401);
});

test('getOrCreateUserFromSession returns existing user when already in db', async () => {
  const queryMock = jest
    .fn()
    .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, email_verified: true }] });
  const getSessionMock = jest.fn().mockResolvedValue({
    user: {
      sub: 'auth0|1',
      email: 'a@b.com',
      given_name: 'A',
      family_name: 'B',
      email_verified: true,
    },
  });

  jest.unstable_mockModule('@/lib/db', () => ({ pool: { query: queryMock } }));
  jest.unstable_mockModule('@/lib/auth0', () => ({ auth0: { getSession: getSessionMock } }));

  const { getOrCreateUserFromSession } = await loadFresh('lib/users.js');
  const result = await getOrCreateUserFromSession();

  expect(result.id).toBe(1);
});
