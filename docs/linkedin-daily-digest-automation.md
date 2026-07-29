# LinkedIn daily digest automation

ShadowContext generates a professional, review-ready daily digest entirely in
GitHub Actions. Gemini performs source-grounded editorial summarization.
Repository-owned HTML and CSS provide the layout, and headless Chrome prints the
HTML to PDF without using AI. The workflow never calls LinkedIn and never
publishes a post.

## Schedule and inputs

`.github/workflows/generate-linkedin-daily-digest.yml` runs every day at 05:00
`Asia/Dubai` (01:00 UTC) and generates the completed previous Dubai calendar
day. A manual run can select a `YYYY-MM-DD` date; leaving it blank also selects
the previous Dubai day. Manual dry runs upload an artifact without committing
review assets.

The workflow requires the existing `GEMINI_API_KEY` GitHub Actions secret. The
optional `LINKEDIN_DIGEST_GEMINI_MODEL` repository variable overrides the
default `gemini-3.5-flash-lite` model.

## Complete source coverage

The source set contains every eligible repository post published on the
selected Dubai date. There is no article-count cap. Draft, future,
`social_publish: false`, and breach-related posts remain excluded under the
site's existing publication policy.

Gemini receives the full selected articles and must return schema-constrained
JSON with exactly one story for every source, in source order. Repository
validation rejects missing, combined, reordered, or extra stories. It also
enforces word limits, exact source IDs, no URLs or markup in generated prose,
three operational watch items, and a bounded LinkedIn caption. Invalid output
is retried up to three times; persistent invalidity fails without committing.

## HTML and PDF output

The reusable, repository-owned template is:

`automation/linkedin-digest/template.html`

Each live run commits an immutable review package under:

`assets/social/linkedin-digest/YYYY-MM-DD/<digest-hash>/`

The package contains:

- `daily-digest.html`, populated with the validated Gemini summary for every
  article;
- `daily-digest.pdf`, printed from that HTML by headless Chrome;
- `linkedin-caption.txt`, including `https://shadowcontext.com/`;
- `digest-content.json`, the validated Gemini editorial structure;
- `digest-manifest.json`, including every source URL and hash, HTML/PDF paths,
  model provenance, `status: review`, and `published: false`.

The HTML follows ShadowContext's navy, cyan, violet, sans-serif, and monospace
visual system. The PDF has no AI rendering dependency: Gemini supplies editorial
copy only, while normal HTML/CSS and Chrome perform the document rendering.

The separate 06:30 LinkedIn document publisher is documented in
`docs/linkedin-daily-digest-publishing.md`.

## Local fixture validation

The test suite does not call Gemini, Chrome, or LinkedIn:

```sh
node --test automation/linkedin-digest/*.test.mjs
```

To generate the fixture HTML locally, set `CHROME_PATH` to a Chrome or Chromium
binary and run:

```sh
node automation/linkedin-digest/cli.mjs \
  --date 2026-07-28 \
  --dry-run true \
  --mock-gemini true
```
