#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { createInstagramClient } from "./instagram-client.mjs";

const marker = "Instagram API live test · 2026-07-27";
const imageUrl =
  "https://shadowcontext.com/assets/social/threads/notegen-needs-capability-boundaries/6b569f65bb1e49f0/slide-01.png";
const caption = `${marker}

ShadowContext briefing: NoteGen needs capability boundaries.

Read the full briefing:
https://shadowcontext.com/notegen-needs-capability-boundaries/

#cybersecurity #AI #ShadowContext`;
const resultPath = path.join(
  process.cwd(),
  "automation/instagram/last-picture-test.json",
);

async function save(value) {
  await mkdir(path.dirname(resultPath), { recursive: true });
  await writeFile(resultPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

try {
  const result = await createInstagramClient().publishPicture({
    imageUrl,
    caption,
    marker,
  });
  const record = {
    status: result.alreadyPublished ? "already_published" : "published",
    instagram_account_id: result.account.id,
    instagram_username: result.account.username,
    token_type: result.account.tokenType,
    instagram_media_id: result.mediaId,
    instagram_permalink: result.permalink,
    image_url: imageUrl,
    checked_at: new Date().toISOString(),
  };
  await save(record);
  console.log(
    JSON.stringify({
      status: record.status,
      username: record.instagram_username,
      permalink: record.instagram_permalink,
    }),
  );
} catch (error) {
  const failure = {
    status: "failed",
    image_url: imageUrl,
    error: String(error.message).slice(0, 1_000),
    checked_at: new Date().toISOString(),
  };
  await save(failure);
  throw error;
}
