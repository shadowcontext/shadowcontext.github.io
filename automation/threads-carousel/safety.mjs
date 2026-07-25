export function sanitizeError(error, maximumLength = 1_000) {
  let message = String(error?.message ?? error ?? "Unknown error");
  for (const secret of [
    process.env.GEMINI_API_KEY,
    process.env.THREADS_ACCESS_TOKEN,
    process.env.THREADS_USER_ID,
  ].filter(Boolean)) {
    message = message.split(secret).join("[REDACTED]");
    message = message.split(encodeURIComponent(secret)).join("[REDACTED]");
  }
  return message
    .replace(/(access_token|api_key|key)=([^&\s]+)/gi, "$1=[REDACTED]")
    .replace(
      /authorization:\s*bearer\s+\S+/gi,
      "authorization: Bearer [REDACTED]",
    )
    .replace(/\bbearer\s+\S+/gi, "Bearer [REDACTED]")
    .slice(0, maximumLength);
}
