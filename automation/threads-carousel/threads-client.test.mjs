import assert from "node:assert/strict";
import test from "node:test";

import { createThreadsClient } from "./threads-client.mjs";

function response(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

test("official Threads carousel sequence creates children, carousel, and publication", async () => {
  const requests = [];
  const identifiers = ["child-1", "child-2", "carousel-1", "post-1"];
  const fetchImpl = async (url, options) => {
    const body = options.body
      ? Object.fromEntries(options.body.entries())
      : undefined;
    requests.push({
      url,
      method: options.method,
      body,
      headers: options.headers,
    });

    if (options.method === "GET") return response({ status: "FINISHED" });
    return response({ id: identifiers.shift() });
  };
  const client = createThreadsClient({
    userId: "numeric-user-id",
    accessToken: "secret-token",
    graphVersion: "v1.0",
    fetchImpl,
    sleep: async () => {},
  });

  const result = await client.publishCarousel({
    imageUrls: [
      "https://shadowcontext.com/one.png",
      "https://shadowcontext.com/two.png",
    ],
    altTexts: ["one", "two"],
    caption: "Fixture caption",
  });

  assert.deepEqual(result, {
    childContainerIds: ["child-1", "child-2"],
    carouselContainerId: "carousel-1",
    threadsPostId: "post-1",
  });
  assert.equal(requests.length, 7);
  assert.equal(requests[0].body.is_carousel_item, "true");
  assert.equal(requests[4].body.media_type, "CAROUSEL");
  assert.equal(requests[4].body.children, "child-1,child-2");
  assert.equal(requests[6].body.creation_id, "carousel-1");
  assert.equal(
    requests.every((request) => !request.url.includes("secret-token")),
    true,
  );
});

test("authentication failures are not retried", async () => {
  let calls = 0;
  const client = createThreadsClient({
    userId: "numeric-user-id",
    accessToken: "secret-token",
    fetchImpl: async () => {
      calls += 1;
      return response({ error: { message: "Invalid token" } }, 401);
    },
    sleep: async () => {},
  });

  await assert.rejects(
    client.publishCarousel({
      imageUrls: [
        "https://shadowcontext.com/one.png",
        "https://shadowcontext.com/two.png",
      ],
      caption: "Fixture",
    }),
    /Threads API request failed \(401\)/,
  );
  assert.equal(calls, 1);
});
