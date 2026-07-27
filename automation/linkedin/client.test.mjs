import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { LinkedInClient } from "./client.mjs";

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: init.status || 200,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

test("client authenticates, uploads every image, and creates a multi-image post", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "linkedin-client-"));
  try {
    await writeFile(path.join(directory, "one.png"), "one");
    await writeFile(path.join(directory, "two.png"), "two");
    const requests = [];
    const responses = [
      jsonResponse({ active: true, scope: "openid profile w_member_social" }),
      jsonResponse({ sub: "12345" }),
      jsonResponse({
        value: {
          uploadUrl: "https://upload.linkedin.test/one",
          image: "urn:li:image:one",
        },
      }),
      new Response(null, { status: 201 }),
      jsonResponse({
        value: {
          uploadUrl: "https://upload.linkedin.test/two",
          image: "urn:li:image:two",
        },
      }),
      new Response(null, { status: 201 }),
      new Response(null, {
        status: 201,
        headers: { "x-restli-id": "urn:li:share:999" },
      }),
    ];
    const client = new LinkedInClient({
      token: "token",
      clientId: "client",
      clientSecret: "secret",
      fetchImpl: async (url, options = {}) => {
        requests.push({ url, options });
        return responses.shift();
      },
    });

    const result = await client.publishCarousel({
      repoRoot: directory,
      carousel: {
        caption: "Defensive briefing https://shadowcontext.com/example/",
        imageFiles: ["one.png", "two.png"],
        altTexts: ["First slide", "Second slide"],
      },
    });

    assert.equal(result.postId, "urn:li:share:999");
    assert.equal(result.owner, "urn:li:person:12345");
    assert.deepEqual(result.imageUrns, [
      "urn:li:image:one",
      "urn:li:image:two",
    ]);
    assert.equal(requests.length, 7);
    const post = JSON.parse(requests[6].options.body);
    assert.equal(post.author, "urn:li:person:12345");
    assert.deepEqual(post.content.multiImage.images, [
      { id: "urn:li:image:one", altText: "First slide" },
      { id: "urn:li:image:two", altText: "Second slide" },
    ]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
