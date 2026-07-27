import path from "node:path";

import { LinkedInClient } from "./client.mjs";
import { prepareQueue } from "./queue.mjs";
import { markFailed, markPublished, saveState } from "./state.mjs";

export async function publishReadyCarousels({
  repoRoot,
  statePath = path.join(repoRoot, "automation/linkedin/state.json"),
  dryRun = false,
  maxPosts = 10,
  now = new Date(),
  env = process.env,
  logger = console,
  clientFactory,
} = {}) {
  const queue = await prepareQueue({
    repoRoot,
    statePath,
    maxPosts,
    now,
  });
  logger.log(`LinkedIn carousel queue: ${JSON.stringify(queue.counters)}`);
  for (const post of queue.posts) {
    logger.log(`Queued: ${post.title} (${post.carouselHash.slice(0, 16)})`);
  }
  if (dryRun || queue.posts.length === 0) return queue;

  const client = clientFactory
    ? clientFactory()
    : new LinkedInClient({
        token: env.LINKEDIN_ACCESS_TOKEN,
        clientId: env.LINKEDIN_CLIENT_ID,
        clientSecret: env.LINKEDIN_CLIENT_SECRET,
      });
  await client.authenticate();

  const failures = [];
  for (const post of queue.posts) {
    try {
      const result = await client.publishCarousel({
        repoRoot,
        carousel: post,
      });
      markPublished(queue.state, post.carouselHash, {
        title: post.title,
        canonical_url: post.canonicalUrl,
        carousel_hash: post.carouselHash,
        generated_at: post.generatedAt,
        image_files: post.imageFiles,
        linkedin_image_urns: result.imageUrns,
        linkedin_author: result.owner,
        linkedin_post_id: result.postId,
        published_at: new Date().toISOString(),
        github_run_id: env.GITHUB_RUN_ID || null,
      });
      await saveState(statePath, queue.state);
      logger.log(`Published LinkedIn post: ${result.postId}`);
    } catch (error) {
      markFailed(queue.state, post.carouselHash, {
        title: post.title,
        canonical_url: post.canonicalUrl,
        carousel_hash: post.carouselHash,
        generated_at: post.generatedAt,
        last_error: error.message,
        failed_at: new Date().toISOString(),
        github_run_id: env.GITHUB_RUN_ID || null,
      });
      await saveState(statePath, queue.state);
      failures.push(`${post.title}: ${error.message}`);
      logger.error(`Failed: ${post.title}: ${error.message}`);
    }
  }
  if (failures.length) {
    throw new Error(
      `${failures.length} LinkedIn carousel publication(s) failed: ${failures.join("; ")}`,
    );
  }
  return queue;
}
