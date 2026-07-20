# ShadowContext

ShadowContext is an independent Jekyll security publication focused on threat intelligence, AI security, and defense engineering.

## Run locally

```sh
bundle install
bundle exec jekyll serve
```

Open `http://127.0.0.1:4000`.

## Content

Long-form posts live in `_posts`. Each article includes source metadata, category routing, reading time, and original editorial artwork from `assets/img/editorial`.

The site has three coverage desks:

- `ai-security`
- `threat-intelligence`
- `defense`

## Hourly briefing automation

`.github/workflows/hourly-content.yml` checks authoritative security feeds once per hour and publishes at most one new source-grounded briefing. It skips runs without meaningful new material.

See [`automation/README.md`](automation/README.md) for the publishing policy, safety controls, repository secret setup, and manual test commands.

## Build verification

```sh
bundle exec jekyll build
```

Generated output is written to `_site` and is excluded from Git.
