#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROMPT_PATH="$REPO_ROOT/automation/daily-seo-prompt.md"
VALIDATOR_PATH="$REPO_ROOT/automation/validate_seo.rb"
LOCK_PATH="${XDG_RUNTIME_DIR:-/tmp}/shadowcontext-daily-seo.lock"
SHARED_BUNDLE_PATH="$REPO_ROOT/vendor/bundle"
RUN_DIR=""
BUILD_LOG=""

export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -F /dev/null}"
export BUNDLE_PATH="$SHARED_BUNDLE_PATH"

log() {
  printf '[shadowcontext-seo] %s\n' "$*"
}

cleanup() {
  if [[ -n "$BUILD_LOG" && "$BUILD_LOG" == /tmp/shadowcontext-seo-jekyll.* ]]; then
    rm -f -- "$BUILD_LOG"
  fi
  if [[ -n "$RUN_DIR" && "$RUN_DIR" == /tmp/shadowcontext-seo.* ]]; then
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
  bash -n "$0"
  ruby -c "$VALIDATOR_PATH" >/dev/null
  git -C "$REPO_ROOT" ls-remote --exit-code origin refs/heads/main >/dev/null
  log "prerequisites, syntax, ChatGPT authentication, and GitHub access are ready"
  exit 0
fi

exec 9>"$LOCK_PATH"
if ! flock -n 9; then
  log "another daily SEO run is active; skipping"
  exit 0
fi

check_prerequisites
git -C "$REPO_ROOT" fetch --quiet origin main
BASE_COMMIT="$(git -C "$REPO_ROOT" rev-parse origin/main)"
RUN_DIR="$(mktemp -d /tmp/shadowcontext-seo.XXXXXX)"
git -C "$REPO_ROOT" worktree add --quiet --detach "$RUN_DIR" "$BASE_COMMIT"

log "starting daily audit from $BASE_COMMIT"
if (
  cd "$RUN_DIR"
  BUNDLE_PATH="$SHARED_BUNDLE_PATH" bundle exec jekyll build >/dev/null
  ruby "$VALIDATOR_PATH" "$RUN_DIR" "$RUN_DIR/_site"
); then
  log "baseline technical SEO checks passed"
else
  log "baseline technical SEO checks found an issue; Codex will attempt a scoped repair"
fi

for live_url in \
  https://shadowcontext.com/ \
  https://shadowcontext.com/robots.txt \
  https://shadowcontext.com/sitemap.xml; do
  if ! curl -L --silent --show-error --fail --max-time 20 --output /dev/null "$live_url"; then
    log "live check warning: $live_url was not reachable"
  fi
done

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
  (
    cd "$RUN_DIR"
    BUNDLE_PATH="$SHARED_BUNDLE_PATH" bundle exec jekyll build >/dev/null
    ruby "$VALIDATOR_PATH" "$RUN_DIR" "$RUN_DIR/_site"
  )
  log "audit complete; no safe SEO change was needed"
  exit 0
fi

if [[ ${#STATUS_LINES[@]} -gt 3 ]]; then
  log "rejected run that changed more than three files"
  exit 1
fi

ALLOWED_PATHS=(
  _includes/head.html _includes/footer.html
  _layouts/default.html _layouts/home.html _layouts/page.html
  _layouts/post.html _layouts/category.html _layouts/tags.html
  _config.yml robots.txt sitemap.xml feed.xml
  tags.html staff.html admin/index.html contact.html
  pages/about.md privacypolicy.md
  category/ai-security.md category/threat-intelligence.md category/defense.md
)
CHANGED_FILES=()
for status_line in "${STATUS_LINES[@]}"; do
  if [[ ! "$status_line" =~ ^[[:space:]]M[[:space:]](.+)$ ]]; then
    log "rejected non-modification change: $status_line"
    exit 1
  fi
  changed_path="${BASH_REMATCH[1]}"
  allowed=0
  for allowed_path in "${ALLOWED_PATHS[@]}"; do
    if [[ "$changed_path" == "$allowed_path" ]]; then
      allowed=1
      break
    fi
  done
  if [[ "$allowed" -ne 1 ]]; then
    log "rejected out-of-scope change: $status_line"
    exit 1
  fi
  CHANGED_FILES+=("$changed_path")
done

BUILD_LOG="$(mktemp /tmp/shadowcontext-seo-jekyll.XXXXXX)"
(
  cd "$RUN_DIR"
  BUNDLE_PATH="$SHARED_BUNDLE_PATH" bundle exec jekyll build 2>&1 | tee "$BUILD_LOG"
  ruby "$VALIDATOR_PATH" "$RUN_DIR" "$RUN_DIR/_site"
)
if grep -Eq '(^|[[:space:]])(Error|ERROR|Fatal|FATAL)([[:space:]:]|$)' "$BUILD_LOG"; then
  log "Jekyll reported a build error"
  exit 1
fi

git -C "$RUN_DIR" add --intent-to-add -- "${CHANGED_FILES[@]}"
git -C "$RUN_DIR" diff --check -- "${CHANGED_FILES[@]}"

git -C "$REPO_ROOT" fetch --quiet origin main
if [[ "$(git -C "$REPO_ROOT" rev-parse origin/main)" != "$BASE_COMMIT" ]]; then
  log "origin/main advanced during the run; leaving the improvement for the next daily audit"
  exit 0
fi

git -C "$RUN_DIR" add -- "${CHANGED_FILES[@]}"
git -C "$RUN_DIR" \
  -c user.name=shadowcontext-seo-bot \
  -c user.email=shadowcontext-seo-bot@users.noreply.github.com \
  commit --quiet -m "Improve technical SEO"
git -C "$RUN_DIR" push --quiet origin HEAD:main
log "published daily technical SEO improvement"
