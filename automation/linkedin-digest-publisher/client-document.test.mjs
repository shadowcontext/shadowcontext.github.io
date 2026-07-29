import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { LinkedInClient } from "../linkedin/client.mjs";

function jsonResponse(value, init = {}) {
  return new Response(JSON.stringify(value), {
    status: init.status || 200,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

test("client uploads a PDF and creates an organic document post", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "linkedin-document-"));
  try {
    await writeFile(path.join(directory, "digest.pdf"), "%PDF-fixture");
    const requests = [];
    const responses = [
      jsonResponse({ active: true, scope: "openid profile w_member_social" }),
      jsonResponse({ sub: "12345" }),
      jsonResponse({
        value: {
          uploadUrl: "https://upload.linkedin.test/document",
          document: "urn:li:document:daily",
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

    const result = await client.publishDocument({
      repoRoot: directory,
      digest: {
        pdfFile: "digest.pdf",
        caption:
          "Daily briefing https://shadowcontext.com/assets/social/linkedin-digest/example/",
        documentTitle: "Daily Security Digest.pdf",
      },
    });

    assert.deepEqual(result, {
      postId: "urn:li:share:999",
      documentUrn: "urn:li:document:daily",
      owner: "urn:li:person:12345",
    });
    assert.equal(requests.length, 5);
    assert.match(requests[2].url, /documents\?action=initializeUpload/);
    const post = JSON.parse(requests[4].options.body);
    assert.equal(post.author, "urn:li:person:12345");
    assert.equal(post.commentary.includes("shadowcontext.com"), true);
    assert.deepEqual(post.content.media, {
      title: "Daily Security Digest.pdf",
      id: "urn:li:document:daily",
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
