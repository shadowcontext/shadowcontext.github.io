#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMPT_PATH="$REPO_ROOT/automation/hourly-content-prompt.md"
VALIDATOR_PATH="$REPO_ROOT/automation/validate_post.rb"
LOCK_PATH="${XDG_RUNTIME_DIR:-/tmp}/shadowcontext-hourly.lock"
SHARED_BUNDLE_PATH="$REPO_ROOT/vendor/bundle"
RUN_DIR=""
BUILD_LOG=""

# The host's system SSH include contains a symlink that OpenSSH rejects inside
# a systemd service mount namespace. GitHub uses the default key and known-hosts
# files, so bypassing only the global client config keeps authentication scoped.
export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -F /dev/null}"

log() {
  printf '[shadowcontext-hourly] %s\n' "$*"
}

cleanup() {
  if [[ -n "$BUILD_LOG" && "$BUILD_LOG" == /tmp/shadowcontext-jekyll.* ]]; then
    rm -f -- "$BUILD_LOG"
  fi
  if [[ -n "$RUN_DIR" && "$RUN_DIR" == /tmp/shadowcontext-hourly.* ]]; then
    git -C "$REPO_ROOT" worktree remove --force "$RUN_DIR" >/dev/null 2>&1 || rmdir "$RUN_DIR" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

check_prerequisites() {
  local missing=0
  for command_name in codex git bundle flock curl ruby; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
      log "missing required command: $command_name"
      missing=1
    fi
  done
  [[ -f "$PROMPT_PATH" ]] || { log "missing prompt: $PROMPT_PATH"; missing=1; }
  [[ -f "$VALIDATOR_PATH" ]] || { log "missing validator: $VALIDATOR_PATH"; missing=1; }
  [[ -d "$SHARED_BUNDLE_PATH" ]] || { log "missing bundled gems: $SHARED_BUNDLE_PATH"; missing=1; }
  if ! codex login status 2>&1 | grep -q 'Logged in using ChatGPT'; then
    log "Codex is not logged in with ChatGPT"
    missing=1
  fi
  if ! git -C "$REPO_ROOT" remote get-url origin >/dev/null 2>&1; then
    log "repository has no origin remote"
    missing=1
  fi
  return "$missing"
}

if [[ "${1:-}" == "--check" ]]; then
  check_prerequisites
  git -C "$REPO_ROOT" ls-remote --exit-code origin refs/heads/main >/dev/null
  log "prerequisites, ChatGPT authentication, and GitHub access are ready"
  exit 0
fi

exec 9>"$LOCK_PATH"
if ! flock -n 9; then
  log "another run is active; skipping"
  exit 0
fi

check_prerequisites
git -C "$REPO_ROOT" fetch --quiet origin main
BASE_COMMIT="$(git -C "$REPO_ROOT" rev-parse origin/main)"
RUN_DIR="$(mktemp -d /tmp/shadowcontext-hourly.XXXXXX)"
git -C "$REPO_ROOT" worktree add --quiet --detach "$RUN_DIR" "$BASE_COMMIT"

log "starting Codex from $BASE_COMMIT"
codex \
  --search \
  --sandbox workspace-write \
  --ask-for-approval never \
  --cd "$RUN_DIR" \
  exec \
  --ephemeral \
  - < "$PROMPT_PATH"

mapfile -t STATUS_LINES < <(git -C "$RUN_DIR" status --porcelain=v1 --untracked-files=all)
if [[ ${#STATUS_LINES[@]} -eq 0 ]]; then
  log "Codex found no story that met the publication threshold"
  exit 0
fi

NEW_POST=""
NEW_IMAGE=""
for status_line in "${STATUS_LINES[@]}"; do
  if [[ "$status_line" =~ ^\?\?[[:space:]](_posts/[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.md)$ ]]; then
    if [[ -n "$NEW_POST" ]]; then
      log "rejected run that created more than one post"
      exit 1
    fi
    NEW_POST="${BASH_REMATCH[1]}"
  elif [[ "$status_line" =~ ^\?\?[[:space:]](assets/img/editorial/[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.svg)$ ]]; then
    if [[ -n "$NEW_IMAGE" ]]; then
      log "rejected run that created more than one image"
      exit 1
    fi
    NEW_IMAGE="${BASH_REMATCH[1]}"
  else
    log "rejected out-of-scope change: $status_line"
    exit 1
  fi
done

[[ -n "$NEW_POST" ]] || { log "no valid post was created"; exit 1; }
[[ -n "$NEW_IMAGE" ]] || { log "no generated image was created"; exit 1; }
post_stem="${NEW_POST#_posts/}"
image_stem="${NEW_IMAGE#assets/img/editorial/}"
if [[ "${post_stem%.md}" != "${image_stem%.svg}" ]]; then
  log "post and image names do not match"
  exit 1
fi

# Generated timestamps can drift a few minutes ahead of the commit. Jekyll
# excludes those posts as future-dated, so normalize to a safely elapsed local
# time before validation, build, and publication.
publication_time="$(TZ=Asia/Dubai date --date='2 minutes ago' '+%Y-%m-%d %H:%M:%S %z')"
ruby - "$RUN_DIR/$NEW_POST" "$publication_time" <<'RUBY'
post_path, publication_time = ARGV
source = File.read(post_path)
unless source.sub!(/^date:.*$/, "date: #{publication_time}")
  abort "generated post is missing a date field"
end
File.write(post_path, source)
RUBY

ruby "$VALIDATOR_PATH" "$RUN_DIR" "$NEW_POST"

mapfile -t SOURCE_URLS < <(sed -nE 's/^[[:space:]]+url: "(https:\/\/[^"[:space:]]+)"$/\1/p' "$RUN_DIR/$NEW_POST")
for source_url in "${SOURCE_URLS[@]}"; do
  if git -C "$RUN_DIR" grep -Fq -- "$source_url" "$BASE_COMMIT" -- '_posts/*.md'; then
    log "rejected source URL already covered by an existing post: $source_url"
    exit 1
  fi
  http_status="$(curl -L --silent --show-error --max-time 20 --retry 1 --output /dev/null --write-out '%{http_code}' "$source_url")"
  if [[ "$http_status" == 000 || "$http_status" == 404 || "$http_status" -ge 500 ]]; then
    log "source URL failed with HTTP $http_status: $source_url"
    exit 1
  fi
done
git -C "$RUN_DIR" add --intent-to-add -- "$NEW_POST" "$NEW_IMAGE"
git -C "$RUN_DIR" diff --check -- "$NEW_POST" "$NEW_IMAGE"

BUILD_LOG="$(mktemp /tmp/shadowcontext-jekyll.XXXXXX)"
(
  cd "$RUN_DIR"
  BUNDLE_PATH="$SHARED_BUNDLE_PATH" bundle exec jekyll build 2>&1 | tee "$BUILD_LOG"
)
if grep -Eq '(^|[[:space:]])(Error|ERROR|Fatal|FATAL)([[:space:]:]|$)' "$BUILD_LOG"; then
  log "Jekyll reported a build error"
  exit 1
fi

git -C "$REPO_ROOT" fetch --quiet origin main
if [[ "$(git -C "$REPO_ROOT" rev-parse origin/main)" != "$BASE_COMMIT" ]]; then
  log "origin/main advanced during the run; leaving publication for the next cycle"
  exit 0
fi

git -C "$RUN_DIR" add -- "$NEW_POST" "$NEW_IMAGE"
git -C "$RUN_DIR" \
  -c user.name=shadowcontext-codex-bot \
  -c user.email=shadowcontext-codex-bot@users.noreply.github.com \
  commit --quiet -m "Publish hourly security briefing"
git -C "$RUN_DIR" push --quiet origin HEAD:main
log "published $NEW_POST"
