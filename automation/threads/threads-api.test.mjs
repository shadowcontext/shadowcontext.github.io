import assert from 'node:assert/strict';
import test from 'node:test';
import { publishThreadsText } from './threads-api.mjs';

test('auto-publishes a Threads text post with environment credentials', async () => {
  const originalUserId = process.env.THREADS_USER_ID;
  const originalAccessToken = process.env.THREADS_ACCESS_TOKEN;
  process.env.THREADS_USER_ID = 'test-user-id';
  process.env.THREADS_ACCESS_TOKEN = 'test-access-token';
  const requests = [];
  const responses = [{ id: 'post-id' }];
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
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'https://graph.threads.net/v1.0/test-user-id/threads');
    assert.equal(requests[0].options.headers.Authorization, 'Bearer test-access-token');
    assert.equal(requests[0].options.body.get('media_type'), 'TEXT');
    assert.equal(requests[0].options.body.get('text'), 'Test Threads text');
    assert.equal(requests[0].options.body.get('auto_publish_text'), 'true');
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

test('explains an unsupported profile ID without exposing credentials', async () => {
  const originalUserId = process.env.THREADS_USER_ID;
  const originalAccessToken = process.env.THREADS_ACCESS_TOKEN;
  process.env.THREADS_USER_ID = 'incorrect-user-id';
  process.env.THREADS_ACCESS_TOKEN = 'secret-user-token';
  const fetchMock = async () => ({
    ok: false,
    status: 400,
    text: async () => JSON.stringify({
      error: {
        message: "Unsupported post request. Object with ID 'incorrect-user-id' does not exist",
      },
    }),
  });

  try {
    await assert.rejects(
      () => publishThreadsText('test', fetchMock),
      (error) => {
        assert.match(error.message, /Threads profile user_id returned by OAuth/);
        assert.doesNotMatch(error.message, /incorrect-user-id/);
        assert.doesNotMatch(error.message, /secret-user-token/);
        return true;
      },
    );
  } finally {
    if (originalUserId === undefined) delete process.env.THREADS_USER_ID;
    else process.env.THREADS_USER_ID = originalUserId;
    if (originalAccessToken === undefined) delete process.env.THREADS_ACCESS_TOKEN;
    else process.env.THREADS_ACCESS_TOKEN = originalAccessToken;
  }
});
