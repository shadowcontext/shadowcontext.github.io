const API_ROOT = 'https://graph.threads.net/v1.0';

function requireCredential(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when dry-run mode is disabled`);
  return value;
}

function safeErrorPayload(payload, credentials) {
  let message;
  try {
    const parsed = JSON.parse(payload);
    message = parsed?.error?.message || parsed?.error?.error_user_msg || payload;
  } catch {
    message = payload;
  }
  for (const credential of credentials) {
    if (credential) message = String(message).replaceAll(credential, '[REDACTED]');
  }
  return String(message).slice(0, 500);
}

async function apiRequest(endpoint, parameters, accessToken, credentials, fetchImplementation) {
  const response = await fetchImplementation(`${API_ROOT}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(parameters),
  });
  const payload = await response.text();
  if (!response.ok) {
    throw new Error(`Threads API request failed (${response.status}): ${safeErrorPayload(payload, credentials)}`);
  }
  const parsed = JSON.parse(payload);
  if (!parsed.id) throw new Error('Threads API response did not include an ID');
  return parsed.id;
}

export async function publishThreadsText(text, fetchImplementation = fetch) {
  const userId = requireCredential('THREADS_USER_ID');
  const accessToken = requireCredential('THREADS_ACCESS_TOKEN');
  const credentials = [userId, accessToken];
  const encodedUserId = encodeURIComponent(userId);
  const containerId = await apiRequest(
    `/${encodedUserId}/threads`,
    { media_type: 'TEXT', text },
    accessToken,
    credentials,
    fetchImplementation,
  );
  return apiRequest(
    `/${encodedUserId}/threads_publish`,
    { creation_id: containerId },
    accessToken,
    credentials,
    fetchImplementation,
  );
}
