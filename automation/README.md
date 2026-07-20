# Local Codex content automation

ShadowContext is updated by the locally installed Codex CLI. It uses the
machine's saved ChatGPT login, so the repository does not need an OpenAI API
key or any OpenAI secret.

## Schedule

The user-level `shadowcontext-hourly.timer` runs at minute 7 of every hour in
the `Asia/Dubai` timezone. Missed runs are caught up after the computer becomes
available again.

Each run:

1. Fetches the current `origin/main` and creates an isolated temporary Git
   worktree. The user's working tree is never modified.
2. Runs `codex --search … exec --ephemeral` with the saved local ChatGPT login.
3. Searches current cybersecurity reporting, with an explicit UAE-first pass
   covering all seven emirates.
4. Creates at most one new, source-grounded post when a story meets the
   publication threshold.
5. Rejects changes outside `_posts/`, edits to existing posts, or more than one
   new article.
6. Validates front matter, article length, source freshness and source URLs,
   then builds Jekyll and checks the diff.
7. Commits as `shadowcontext-codex-bot` and pushes to `main` through the
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

## Checks and operations

```sh
automation/run_hourly_codex.sh --check
systemctl --user status shadowcontext-hourly.timer
systemctl --user list-timers shadowcontext-hourly.timer
journalctl --user -u shadowcontext-hourly.service
```

Run one cycle immediately:

```sh
systemctl --user start shadowcontext-hourly.service
```

Disable the local automation without changing the repository:

```sh
systemctl --user disable --now shadowcontext-hourly.timer
```
