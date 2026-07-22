import assert from 'node:assert/strict';
import test from 'node:test';
import { publishThreadsText } from './threads-api.mjs';

test('creates and publishes a Threads text container with environment credentials', async () => {
  const originalUserId = process.env.THREADS_USER_ID;
  const originalAccessToken = process.env.THREADS_ACCESS_TOKEN;
  process.env.THREADS_USER_ID = 'test-user-id';
  process.env.THREADS_ACCESS_TOKEN = 'test-access-token';
  const requests = [];
  const responses = [{ id: 'container-id' }, { id: 'post-id' }];
  const fetchMock = async (url, options) => {
    requests.push({ url, options });
    return {
      ok: true,
      text: async () => JSON.stringify(responses.shift()),
    };
  };

  try {
    const postId = await publishThreadsText('Test Threads text', fetchMock);
    assert.equal(postId, 'post-id');
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url, 'https://graph.threads.net/v1.0/test-user-id/threads');
    assert.equal(requests[1].url, 'https://graph.threads.net/v1.0/test-user-id/threads_publish');
    assert.equal(requests[0].options.headers.Authorization, 'Bearer test-access-token');
    assert.equal(requests[0].options.body.get('media_type'), 'TEXT');
    assert.equal(requests[0].options.body.get('text'), 'Test Threads text');
    assert.equal(requests[1].options.body.get('creation_id'), 'container-id');
  } finally {
    if (originalUserId === undefined) delete process.env.THREADS_USER_ID;
    else process.env.THREADS_USER_ID = originalUserId;
    if (originalAccessToken === undefined) delete process.env.THREADS_ACCESS_TOKEN;
    else process.env.THREADS_ACCESS_TOKEN = originalAccessToken;
  }
});

test('requires credentials only when a real API call is attempted', async () => {
  const originalUserId = process.env.THREADS_USER_ID;
  const originalAccessToken = process.env.THREADS_ACCESS_TOKEN;
  delete process.env.THREADS_USER_ID;
  delete process.env.THREADS_ACCESS_TOKEN;
  try {
    await assert.rejects(() => publishThreadsText('test', async () => {}), /THREADS_USER_ID is required/);
  } finally {
    if (originalUserId !== undefined) process.env.THREADS_USER_ID = originalUserId;
    if (originalAccessToken !== undefined) process.env.THREADS_ACCESS_TOKEN = originalAccessToken;
  }
});
