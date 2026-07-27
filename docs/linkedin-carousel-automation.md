# LinkedIn carousel automation

ShadowContext automatically publishes each new ready Threads carousel as an
organic LinkedIn multi-image post. LinkedIn calls this format `multiImage`;
organic carousel ads are a separate sponsored format.

## Workflow

`.github/workflows/publish-linkedin-carousels.yml` runs after the
**Generate Threads Carousels** workflow completes successfully. It also reacts
to `carousel-manifest.json` files committed under `assets/social/threads/` by
users or external automation, runs hourly as a recovery pass, and supports
manual dispatch. The explicit workflow handoff is required because GitHub does
not start another push workflow from commits authenticated by the originating
workflow's built-in `GITHUB_TOKEN`.

Each run:

1. validates the LinkedIn modules and runs their unit tests;
2. discovers ready manifests and filters future-dated, historical, and already
   published carousels;
3. uploads every PNG through LinkedIn's Images API;
4. creates one public multi-image post through the Posts API;
5. commits the returned image URNs and LinkedIn post ID to
   `automation/linkedin/state.json`.

Candidates are processed oldest-first, with a default limit of 10 per run.
Set the repository variable `LINKEDIN_MAX_POSTS_PER_RUN` to a smaller positive
integer if needed.

## Required secrets and permissions

The workflow reads these GitHub Actions secrets:

- `LINKEDIN_CLIENT_ID`
- `LINKEDIN_CLIENT_SECRET`
- `LINKEDIN_ACCESS_TOKEN`

The member access token must include `openid`, `profile`, and
`w_member_social`. The first two scopes resolve the member URN; the last allows
the post. Tokens expire or may be revoked, so rotate the access-token secret
before expiry.

## Idempotency and initial cutoff

`automation/linkedin/state.json` is the durable duplicate guard. A carousel is
identified by its content hash and is never posted again after a successful
state record.

The state starts at the carousel successfully posted in GitHub Actions run
`30286894486`. Its `ignoreBeforeGeneratedAt` cutoff deliberately excludes the
older Threads carousel backlog. Only manifests generated after that cutoff are
eligible for automatic LinkedIn publishing.

If LinkedIn accepts a post but the runner terminates before committing state,
inspect the LinkedIn profile before retrying because the API cannot provide an
atomic transaction across LinkedIn and GitHub.

## Local validation

No credentials or network calls are used by the dry run:

```sh
node --check automation/linkedin/*.mjs
node --test automation/linkedin/*.test.mjs
node automation/linkedin/cli.mjs --dry-run true
```
