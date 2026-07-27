import assert from "node:assert/strict";
import test from "node:test";

import { createInstagramClient } from "./instagram-client.mjs";

function response(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("publishes and verifies one picture with an Instagram Login token", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes("/me?")) {
      return response({
        id: "17841400000000000",
        username: "shadowcontext",
        account_type: "BUSINESS",
      });
    }
    if (String(url).includes("/media?")) return response({ data: [] });
    if (String(url).endsWith("/media")) return response({ id: "container-1" });
    if (String(url).includes("/container-1?")) {
      return response({ status_code: "FINISHED" });
    }
    if (String(url).endsWith("/media_publish")) {
      return response({ id: "media-1" });
    }
    return response({
      id: "media-1",
      permalink: "https://www.instagram.com/p/example/",
    });
  };

  const client = createInstagramClient({
    accessToken: "test-token",
    fetchImpl,
    sleep: async () => {},
  });
  const result = await client.publishPicture({
    imageUrl: "https://example.com/picture.png",
    caption: "Live test marker",
    marker: "Live test marker",
  });

  assert.equal(result.mediaId, "media-1");
  assert.equal(result.permalink, "https://www.instagram.com/p/example/");
  assert.equal(result.account.username, "shadowcontext");
  assert.equal(result.account.tokenType, "instagram_login");
  assert.equal(calls.length, 6);
});

test("requires the dedicated Instagram secret", () => {
  assert.throws(
    () => createInstagramClient({ accessToken: "" }),
    /INSTAGRAM_ACCESS_TOKEN is required/,
  );
});
