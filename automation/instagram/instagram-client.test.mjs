import assert from "node:assert/strict";
import test from "node:test";

import { createInstagramClient } from "./instagram-client.mjs";

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  };
}

test("publishes an Instagram carousel after discovering the account", async () => {
  const calls = [];
  let container = 0;
  const client = createInstagramClient({
    accessToken: "test-token",
    sleep: async () => {},
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), method: options.method });
      if (String(url).includes("/me?")) {
        return response({ id: "ig-user", username: "shadowcontext" });
      }
      if (String(url).includes("/media_publish")) {
        return response({ id: "published-media" });
      }
      if (options.method === "POST") {
        container += 1;
        return response({ id: `container-${container}` });
      }
      if (String(url).includes("/published-media?")) {
        return response({
          id: "published-media",
          permalink: "https://www.instagram.com/p/example/",
        });
      }
      return response({ status_code: "FINISHED" });
    },
  });
  const result = await client.publishCarousel({
    imageUrls: ["https://example.com/1.png", "https://example.com/2.png"],
    caption: "Defensive briefing #cybersecurity",
  });
  assert.equal(result.account.id, "ig-user");
  assert.equal(result.mediaId, "published-media");
  assert.equal(result.permalink, "https://www.instagram.com/p/example/");
  assert.equal(
    calls.some((call) => call.url.includes("/media_publish")),
    true,
  );
});

test("does not expose the access token in API errors", async () => {
  const client = createInstagramClient({
    accessToken: "secret-token",
    fetchImpl: async () =>
      response({ error: { message: "Rejected secret-token" } }, 400),
  });
  await assert.rejects(client.discoverAccount(), (error) => {
    assert.equal(error.message.includes("secret-token"), false);
    assert.match(error.message, /\[REDACTED]/);
    return true;
  });
});
