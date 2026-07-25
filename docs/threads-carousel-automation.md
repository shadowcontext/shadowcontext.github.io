# Threads carousel automation

ShadowContext generates and publishes branded Threads carousels through two
independent GitHub Actions workflows. No coding agent, always-on device,
browser automation, or external database is required at runtime.

## Architecture

The workflow boundary is deliberately durable:

1. `.github/workflows/generate-threads-carousels.yml` runs whenever a Markdown
   file is newly added under `_posts/`. It uses Gemini for structured copy,
   renders the carousel, and commits immutable PNGs plus a sanitized
   `carousel-manifest.json` beside them.
2. `.github/workflows/publish-threads-carousels.yml` runs at 12:00 and 00:00
   Dubai time. It finds repository manifests that are ready but absent from
   publication state, verifies their public image URLs, and publishes them.

The workflows run the small Node.js modules in
`automation/threads-carousel/`:

1. `windows.mjs` calculates a half-open Dubai publication window.
2. `posts.mjs` reads Jekyll posts and their YAML front matter directly from
   `_posts/`.
3. `gemini.mjs` asks Gemini for schema-constrained, source-grounded slide copy.
4. `schema.mjs` applies stricter word, formatting, identifier, caption, and URL
   checks in repository code.
5. `renderer.mjs` deterministically renders four 1080 × 1350 RGB PNG slides with
   Sharp and SVG.
6. `hosting.mjs` confirms that every image is publicly available over HTTPS.
7. `threads-client.mjs` creates and polls image containers, creates and polls
   the carousel container, and publishes through the official Threads API.
8. `queue.mjs` discovers generated carousel manifests and suppresses already
   published or future-dated items.
9. `state.mjs` records final publication only after Threads returns a post ID.
10. `orchestrator.mjs` coordinates posts independently and writes sanitized
    manifests.

The workflow runs formatting checks, syntax checks, and unit tests before it
generates or publishes media. External Gemini and Threads requests are mocked
in tests.

## Triggers and Dubai schedule

Generation is event-driven. A push to `main` triggers it only when the pushed
range contains a newly added `_posts/*.md` file. Modified and deleted posts do
not create another carousel. Multiple newly added posts in one push are
processed independently.

GitHub cron expressions use UTC, so the publishing workflow uses:

- `0 8 * * *` for 12:00 `Asia/Dubai`;
- `0 20 * * *` for 00:00 `Asia/Dubai` on the following local date.

Dubai is UTC+4 year-round. The publisher does not use a fragile “last 12 hours”
query. Its durable queue is every validated carousel manifest not marked
`published` in `state.json`. This means a missed or failed run is recovered by
the next run. A carousel for a future-dated article remains queued until its
canonical front-matter timestamp has passed.

## Post discovery and eligibility

The automation uses the repository-native Jekyll source rather than scraping
the deployed site. It reads `_config.yml` to apply the site's
`/:title/` permalink convention and canonical `https://shadowcontext.com`
origin. Each selected post must have a title, exact front-matter publication
timestamp, valid canonical URL, and a substantive Markdown body.

Posts are skipped when they are drafts, have `published: false`, have
`social_publish: false`, or are breach-related under ShadowContext's standing
editorial automation policy. A future-dated post may have its media generated,
but the publishing queue will not release it early. Published state suppresses
duplicates. Ready carousels are processed oldest-generated first. The
conservative default is 10 posts per publishing run; excess posts remain queued
for a later run.

## Carousel format and branding

Every carousel contains three or four portrait PNGs:

1. branded cover;
2. `WHAT HAPPENED`;
3. `WHY IT MATTERS`;
4. `WHAT DEFENDERS SHOULD DO`.

All slides are exactly 1080 × 1350 pixels, standard RGB, with large type,
high-contrast safe areas, at most three bullets per section, consistent slide
numbers, `SHADOWCONTEXT.COM`, and the site's cyan/violet geometric brand motif.
For a short article with one concise impact point, the final two sections share
one slide so the carousel does not add unnecessary pages. Longer articles use
the preferred four-slide sequence.
The renderer uses the site's Space Grotesk and DM Mono font families when
available and safe system fallbacks on GitHub runners. It does not ask an image
model to draw text. Deterministic gradients, grids, and abstract network
geometry keep rendering reliable when no illustration exists.

Every Threads caption contains exactly one canonical article URL and the
consistent reach tags `#cybersecurity`, `#cybernews`, `#vulnerability`, and
`#ai`. Up to two additional hashtags are deterministically derived from the
post category and existing tags. Hashtags supplied in generated prose are
discarded, so the automation cannot introduce unrelated trending tags. When
necessary, only the caption prose is shortened; the controlled hashtags and
article URL are preserved within the 500-character limit.

## Gemini configuration

The official `@google/genai` SDK uses `gemini-3.5-flash-lite` by default. Set
the repository variable `GEMINI_MODEL` to change the model without changing
code. The prompt requires factual defensive language and structured JSON.
[Google's structured-output documentation](https://ai.google.dev/gemini-api/docs/structured-output)
describes the schema-backed response mode used here.
Repository validation enforces:

- headline and bullet word limits;
- no Markdown or URLs in slide copy;
- one to three bullets per section;
- source grounding for generated CVE and version identifiers;
- no invented attribution or offensive instructions;
- a Threads caption containing exactly one canonical article URL.

Invalid JSON is retried at most three times with concise validation feedback.
A post that remains invalid fails safely and is not recorded as published.

## Required GitHub secrets

Configure these under **Repository settings → Secrets and variables → Actions →
Secrets**:

| Secret                 |                Required | Purpose                                                                 |
| ---------------------- | ----------------------: | ----------------------------------------------------------------------- |
| `GEMINI_API_KEY`       |                     Yes | Gemini structured summarization and optional non-text visual generation |
| `THREADS_ACCESS_TOKEN` | Yes for live publishing | Authenticates official Threads API requests                             |
| `THREADS_USER_ID`      | Yes for live publishing | Identifies the publishing Threads account                               |

`THREADS_USER_ID` must be the numeric Threads user ID associated with the
access token. The Meta app and token need `threads_basic` and
`threads_content_publish`. Follow Meta's official
[Threads API getting-started guide](https://developers.facebook.com/docs/threads/get-started/)
and [publishing guide](https://developers.facebook.com/docs/threads/posts/).
Never add credentials to the sample environment file, workflow inputs, logs,
commits, or issue comments.

Threads access tokens expire or can be invalidated when permissions, account
security, or app configuration changes. Monitor scheduled runs, rotate the
secret before expiry, and confirm that the replacement token belongs to the
same numeric user ID. Updating a GitHub secret does not require a code change.

## Repository variables and emergency stop

Configure these under **Repository settings → Secrets and variables → Actions →
Variables**:

| Variable                     | Default                 | Purpose                                     |
| ---------------------------- | ----------------------- | ------------------------------------------- |
| `THREADS_PUBLISHING_ENABLED` | unset / disabled        | Must be exactly `true` for any live run     |
| `THREADS_MAX_POSTS_PER_RUN`  | `10`                    | Conservative oldest-first processing limit  |
| `GEMINI_MODEL`               | `gemini-3.5-flash-lite` | Supported Gemini text model                 |
| `THREADS_GRAPH_API_VERSION`  | `v1.0`                  | Threads Graph API version used in one place |

To disable publishing immediately, set `THREADS_PUBLISHING_ENABLED` to
`false`. Scheduled runs fail closed before generation or API calls. You can
also disable the workflow from the Actions page.

Meta versions and retires Graph API versions. Review Meta's official Threads
API changelog, test a dry run, then update `THREADS_GRAPH_API_VERSION` to a
currently supported `vN.N` value. The version is validated and used only by the
Threads client.

## Public image hosting

The generation workflow writes immutable, content-addressed media under:

`assets/social/threads/<post-slug>/<carousel-hash>/slide-01.png`

The same directory contains `carousel-manifest.json`, the durable handoff
between the workflows. It holds public image URLs, alt text, caption, hashes,
and timestamps, but no article body or credential. The generation workflow
commits the directory with a `[skip threads]` marker and pushes it through the
existing GitHub Pages deployment. The later publishing workflow polls each
expected `https://shadowcontext.com/assets/social/threads/...` URL until it
returns a PNG. Threads is not called if any image is unavailable. Old media is
not overwritten. Both workflows share one concurrency group so repository
media and state commits cannot race.

The content hash includes a carousel template version. Increment
`CAROUSEL_TEMPLATE_VERSION` in `config.mjs` when changing the rendered design
or layout so new output never overwrites an older visual.

## Dry runs

To test generation:

1. Open **Actions → Generate Threads Carousels → Run workflow**.
2. Enter a canonical post URL, slug, filename, or `_posts/...` path.
3. Leave **dry_run** checked and select **Run workflow**.
4. Download `threads-carousel-generation-<run-id>` from **Artifacts**.

This calls Gemini and renders all slides, but does not commit public images,
construct a Threads client, call Threads, or modify publication state.

To preview the publishing queue:

1. Open **Actions → Publish Ready Threads Carousels → Run workflow**.
2. Leave **dry_run** checked and select **Run workflow**.
3. Download `threads-carousel-publish-preview-<run-id>`.

The preview reads the same durable queue and duplicate state as a scheduled
run, but never calls Threads or changes state.

For a local fixture-style render without Gemini or Threads:

```sh
npm ci
node automation/threads-carousel/cli.mjs prepare \
  --dry-run true \
  --mock-gemini \
  --post moxa-linux-flaw-makes-ot-inventory-a-patch-control
```

Output is written to `.artifacts/threads-carousel/`, which Git ignores.

## Manual live tests

To commit media for one existing post, run **Generate Threads Carousels**
manually with its exact URL and uncheck **dry_run**. This does not publish to
Threads; it creates the repository-hosted carousel and ready manifest.

Only after inspecting that media, confirm the Threads secrets, set
`THREADS_PUBLISHING_ENABLED=true`, and run **Publish Ready Threads Carousels**
with **dry_run** unchecked. This publishes every oldest-first ready carousel up
to `THREADS_MAX_POSTS_PER_RUN`. There is intentionally no force-republish
option. To restrict an initial live test to one queued item, temporarily set
`THREADS_MAX_POSTS_PER_RUN=1`.

## Idempotency, partial failures, and recovery

`automation/threads-carousel/state.json` uses the normalized canonical URL as
its key. A successful record includes the source and carousel hashes, public
image URLs, media container IDs, final Threads post ID, and timestamps. Only
`status: published` suppresses future publication. Editing an article does not
trigger generation, and regenerating media for an already-published article
does not automatically repost it.

Failed preparation or API calls are recorded as failures, never as successful
publication. Other eligible articles continue processing, and the final job
fails when any article failed. Rerunning retries failed records while published
records remain suppressed.

There is one unavoidable duplicate-risk edge case: Threads may accept the
final publish request but the runner may terminate before it saves and pushes
the returned post ID. Before rerunning after an abrupt cancellation or
repository push failure, inspect the Threads account and the run manifest.
Never delete a published state record merely to retry. Partially created,
unpublished media containers do not mark an article as published and may expire
on Meta's side.

The publishing workflow commits state after processing all candidates. The
shared concurrency group, immutable media, canonical URL key, and
published-only suppression protect ordinary reruns. Live republishing of an
already-published URL is intentionally unavailable.

## Limits, logs, and artifacts

The client enforces the current 500-character Threads text limit in repository
code and the official carousel range of 2–20 media items. ShadowContext uses
three or four. API calls have bounded retries, exponential backoff, request
timeouts, and bounded processing polls. Authentication and malformed-request
errors are not retried.

Logs contain the selected window, counts, titles, canonical URLs, and statuses,
but not article bodies, tokens, request authorization headers, or secret-bearing
URLs. The sanitized `threads-carousel-run-<run-id>` artifact is retained for 14
days and contains the manifest and validated structured JSON. Generated live
PNGs remain in the site's public media path.

Run local quality gates with:

```sh
npm ci
npm run format:threads-carousel:check
npm run lint:threads-carousel
npm run test:threads-carousel
```
