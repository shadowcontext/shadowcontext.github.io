import path from "node:path";

import { LinkedInClient } from "../linkedin/client.mjs";
import { markFailed, markPublished, saveState } from "../linkedin/state.mjs";
import { prepareDigest } from "./queue.mjs";

export async function publishDailyDigest({
  repoRoot,
  targetDate,
  statePath = path.join(
    repoRoot,
    "automation/linkedin-digest-publisher/state.json",
  ),
  dryRun = false,
  env = process.env,
  logger = console,
  clientFactory,
} = {}) {
  const queue = await prepareDigest({ repoRoot, targetDate, statePath });
  logger.log(`LinkedIn digest queue: ${JSON.stringify(queue.counters)}`);
  if (queue.digest) {
    logger.log(
      `Queued digest: ${queue.digest.title} (${queue.digest.digestHash.slice(0, 16)})`,
    );
    logger.log(`Briefing link: ${queue.digest.htmlUrl}`);
  }
  if (dryRun || !queue.digest) return queue;

  const client = clientFactory
    ? clientFactory()
    : new LinkedInClient({
        token: env.LINKEDIN_ACCESS_TOKEN,
        clientId: env.LINKEDIN_CLIENT_ID,
        clientSecret: env.LINKEDIN_CLIENT_SECRET,
      });
  await client.authenticate();

  try {
    const result = await client.publishDocument({
      repoRoot,
      digest: queue.digest,
    });
    markPublished(queue.state, queue.digest.digestHash, {
      title: queue.digest.title,
      digest_date: queue.digest.digestDate,
      digest_hash: queue.digest.digestHash,
      generated_at: queue.digest.generatedAt,
      briefing_url: queue.digest.htmlUrl,
      pdf_file: queue.digest.pdfFile,
      linkedin_caption: queue.digest.caption,
      linkedin_document_urn: result.documentUrn,
      linkedin_author: result.owner,
      linkedin_post_id: result.postId,
      published_at: new Date().toISOString(),
      github_run_id: env.GITHUB_RUN_ID || null,
    });
    await saveState(statePath, queue.state);
    logger.log(`Published LinkedIn digest: ${result.postId}`);
  } catch (error) {
    markFailed(queue.state, queue.digest.digestHash, {
      title: queue.digest.title,
      digest_date: queue.digest.digestDate,
      digest_hash: queue.digest.digestHash,
      generated_at: queue.digest.generatedAt,
      briefing_url: queue.digest.htmlUrl,
      pdf_file: queue.digest.pdfFile,
      last_error: error.message,
      failed_at: new Date().toISOString(),
      github_run_id: env.GITHUB_RUN_ID || null,
    });
    await saveState(statePath, queue.state);
    throw new Error(`LinkedIn digest publication failed: ${error.message}`);
  }
  return queue;
}
