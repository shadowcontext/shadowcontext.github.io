# Local Codex content automation

ShadowContext is updated by the locally installed Codex CLI. It uses the
machine's saved ChatGPT login, so the repository does not need an OpenAI API
key or any OpenAI secret.

## Schedule

The user-level `shadowcontext-hourly.timer` runs at minute 7 of every hour in
the `Asia/Dubai` timezone. Missed runs are caught up after the computer becomes
available again.

The user-level `shadowcontext-daily-seo.timer` runs once daily at 04:37 in the
`Asia/Dubai` timezone, with up to ten minutes of randomized delay. It audits
the rendered and live site, applies at most one safe technical SEO improvement
when evidence supports it, validates the result, and pushes automatically.

The user-level `shadowcontext-threat-dashboard.timer` runs once daily at 05:17
in the `Asia/Dubai` timezone. It refreshes the Threat Intel Dashboard from
allowlisted government feeds, rebuilds the normalized TLP:CLEAR IOC download
and type-specific threat feeds, validates the site, and pushes the generated
data automatically.

Each run:

1. Fetches the current `origin/main` and creates an isolated temporary Git
   worktree. The user's working tree is never modified.
2. Runs `codex --search … exec --ephemeral` with the saved local ChatGPT login.
3. Searches current cybersecurity reporting, with an explicit UAE-first pass
   covering all seven emirates.
4. Rejects any story concerning an organizational breach, with an explicit
   no-exceptions rule for organizations in the Middle East.
5. Creates at most one new, source-grounded post and one original,
   story-specific SVG image when an eligible story meets the publication
   threshold.
6. Rejects edits to existing files, any other new files, mismatched post and
   image names, or more than one new article and image pair.
7. Validates front matter, article length, generated image structure, source
   freshness and source URLs, then builds Jekyll and checks the diff.
8. Commits as `shadowcontext-codex-bot` and pushes to `main` through the
   machine's existing GitHub SSH credentials.

No search provider can guarantee literal coverage of every page on the public
web. The prompt therefore requires broad web discovery, primary-source
verification, explicit UAE searches in English and Arabic where useful, and a
clear no-publication outcome when evidence is too thin.

## Files

- `run_hourly_codex.sh` is the guarded runner.
- `hourly-content-prompt.md` is the recurring editorial brief.
- `validate_post.rb` enforces the publication schema and editorial bounds.
- `systemd/shadowcontext-hourly.service` defines the one-shot job.
- `systemd/shadowcontext-hourly.timer` defines the hourly schedule.
- `run_daily_seo.sh` is the guarded daily SEO runner.
- `daily-seo-prompt.md` limits the SEO agent to evidence-based technical work.
- `update_threat_dashboard.py` gathers and normalizes allowlisted CISA, UK
  NCSC, and Saudi NCA/Saudi CERT sources.
- `run_daily_threat_dashboard.sh` performs the isolated, validated dashboard
  refresh and publishes only the generated JSON, IOC CSV, and four typed feeds.
- `validate_seo.rb` audits indexable URLs, metadata, structured data, links,
  crawler files, feeds, and post images.
- `threads/publish-to-threads.mjs` formats eligible Jekyll posts and publishes
  them through Meta's official Threads API. Setup and operating guidance lives
  in `docs/threads-auto-publishing.md`.
- `systemd/shadowcontext-daily-seo.service` defines the daily SEO job.
- `systemd/shadowcontext-daily-seo.timer` defines the daily SEO schedule.

## Checks and operations

```sh
automation/run_hourly_codex.sh --check
automation/run_daily_seo.sh --check
automation/run_daily_threat_dashboard.sh --check
systemctl --user status shadowcontext-hourly.timer
systemctl --user status shadowcontext-daily-seo.timer
systemctl --user status shadowcontext-threat-dashboard.timer
systemctl --user list-timers shadowcontext-hourly.timer shadowcontext-daily-seo.timer shadowcontext-threat-dashboard.timer
journalctl --user -u shadowcontext-hourly.service
journalctl --user -u shadowcontext-daily-seo.service
```

Run one cycle immediately:

```sh
systemctl --user start shadowcontext-hourly.service
systemctl --user start shadowcontext-daily-seo.service
systemctl --user start shadowcontext-threat-dashboard.service
```

Disable the local automation without changing the repository:

```sh
systemctl --user disable --now shadowcontext-hourly.timer
systemctl --user disable --now shadowcontext-daily-seo.timer
systemctl --user disable --now shadowcontext-threat-dashboard.timer
```
