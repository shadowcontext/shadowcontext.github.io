# LinkedIn daily digest publishing

ShadowContext publishes the completed daily digest PDF as an organic LinkedIn
document post through a separate GitHub Actions workflow. No Codex runtime is
involved.

## Schedule

`.github/workflows/publish-linkedin-daily-digest.yml` runs every day at 06:30
`Asia/Dubai` (02:30 UTC). It selects the completed previous Dubai calendar
day, 90 minutes after the digest generator runs at 05:00.

Manual dispatch supports an explicit digest date. Manual runs default to dry-run
mode so validation does not accidentally publish a post. Scheduled runs publish.

## Post contents

The workflow selects the newest schema-version-2 digest package for the target
date and publishes its `daily-digest.pdf` as a native LinkedIn document. The
commentary contains:

- the Gemini-written `caption_intro` from the validated digest content;
- the number and date of included ShadowContext briefings;
- the public `daily-digest.html` briefing-page URL on
  `https://shadowcontext.com/`;
- controlled cybersecurity hashtags, with `#AISecurity` included when the
  digest contains AI-security coverage.

The PDF itself is uploaded from the checked-out repository. The publisher does
not call Gemini or generate media.

## LinkedIn API flow

The publisher:

1. introspects the access token and resolves the authenticated member URN;
2. initializes and uploads the PDF through LinkedIn's Documents API;
3. creates a public organic document post through LinkedIn's Posts API;
4. records the document URN and post ID in
   `automation/linkedin-digest-publisher/state.json`.

The workflow uses these existing GitHub Actions secrets:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_ACCESS_TOKEN`

The token must include `openid`, `profile`, and `w_member_social`.

## Duplicate protection

Only one successful post is allowed per digest date. The durable state file
prevents normal retries or regenerated packages for the same day from creating
another post.

LinkedIn publication and the Git commit cannot be one atomic transaction. If
LinkedIn accepts a post but the runner terminates before the state commit
reaches `main`, verify the LinkedIn profile before manually retrying.

## Validation

The following commands use no credentials and make no LinkedIn calls:

```sh
node --check automation/linkedin/*.mjs
node --check automation/linkedin-digest-publisher/*.mjs
node --test \
  automation/linkedin/*.test.mjs \
  automation/linkedin-digest-publisher/*.test.mjs
node automation/linkedin-digest-publisher/cli.mjs \
  --date 2026-07-28 \
  --dry-run true
```
