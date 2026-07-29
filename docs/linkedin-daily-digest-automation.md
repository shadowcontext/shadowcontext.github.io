# LinkedIn daily digest automation

ShadowContext generates a professional, review-ready daily LinkedIn digest
entirely in GitHub Actions. The workflow uses Gemini for source-grounded
editorial synthesis and repository code for deterministic branded rendering.
It never calls LinkedIn and never publishes a post.

## Schedule and inputs

`.github/workflows/generate-linkedin-daily-digest.yml` runs at 00:15
`Asia/Dubai` and generates the completed previous Dubai calendar day. A manual
run can select a `YYYY-MM-DD` date or leave the field blank to use the current
Dubai date. Manual dry runs create an artifact without committing assets.

The workflow requires the existing `GEMINI_API_KEY` GitHub Actions secret. The
optional `LINKEDIN_DIGEST_GEMINI_MODEL` repository variable overrides the
default stable `gemini-3.5-flash-lite` model.

## Output

Each live run commits an immutable package under:

`assets/social/linkedin-digest/YYYY-MM-DD/<digest-hash>/`

The package contains:

- 1080 × 1350 RGB PNG slides styled with ShadowContext's navy, cyan, violet,
  Space Grotesk, and DM Mono visual system;
- `linkedin-caption.txt`, including `https://shadowcontext.com/` and controlled
  professional hashtags;
- `digest-content.json`, the validated Gemini editorial structure;
- `digest-manifest.json`, including source URLs, source hashes, image paths,
  alt text, the Gemini model, and `status: review`.

The manifest is explicitly marked `linkedinReady: true` and
`published: false`. Human review is required before any separate publishing
process uses the package.

## Editorial controls

The source set comes only from eligible repository posts published on the
selected Dubai date. Draft, future, `social_publish: false`, and breach-related
posts remain excluded under the existing site policy.

Gemini receives the full selected articles and must return schema-constrained
JSON with one story per source, in source order. Repository validation enforces
word limits, exact source IDs, no URLs or markup in generated prose, three
operational watch items, and a bounded LinkedIn caption. Invalid output is
retried up to three times; persistent invalidity fails without committing.

Rendering is deterministic SVG-to-PNG code using Sharp. Gemini writes the
editorial copy but does not draw text or branding.

## Local fixture validation

The fixture path makes no Gemini or LinkedIn requests:

```sh
node --test automation/linkedin-digest/*.test.mjs
node automation/linkedin-digest/cli.mjs \
  --date 2026-07-29 \
  --dry-run true \
  --mock-gemini true
```
