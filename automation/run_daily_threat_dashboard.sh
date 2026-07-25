#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPDATER="$REPO_ROOT/automation/update_threat_dashboard.py"
VALIDATOR="$REPO_ROOT/automation/validate_seo.rb"
DATA_VALIDATOR="$REPO_ROOT/automation/validate_threat_dashboard.py"
LOCK_PATH="${XDG_RUNTIME_DIR:-/tmp}/shadowcontext-threat-dashboard.lock"
SHARED_BUNDLE_PATH="$REPO_ROOT/vendor/bundle"
RUN_DIR=""

export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -F /dev/null}"
export BUNDLE_PATH="$SHARED_BUNDLE_PATH"

log() { printf '[shadowcontext-intel] %s\n' "$*"; }

cleanup() {
  if [[ -n "$RUN_DIR" && "$RUN_DIR" == /tmp/shadowcontext-intel.* ]]; then
    git -C "$REPO_ROOT" worktree remove --force "$RUN_DIR" >/dev/null 2>&1 || rmdir "$RUN_DIR" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

check_prerequisites() {
  local missing=0
  for command_name in git bundle flock python3 ruby; do
    command -v "$command_name" >/dev/null 2>&1 || { log "missing required command: $command_name"; missing=1; }
  done
  [[ -f "$UPDATER" ]] || { log "missing updater: $UPDATER"; missing=1; }
  [[ -f "$VALIDATOR" ]] || { log "missing validator: $VALIDATOR"; missing=1; }
  [[ -f "$DATA_VALIDATOR" ]] || { log "missing data validator: $DATA_VALIDATOR"; missing=1; }
  [[ -d "$SHARED_BUNDLE_PATH" ]] || { log "missing bundled gems: $SHARED_BUNDLE_PATH"; missing=1; }
  git -C "$REPO_ROOT" remote get-url origin >/dev/null 2>&1 || { log "repository has no origin remote"; missing=1; }
  return "$missing"
}

if [[ "${1:-}" == "--check" ]]; then
  check_prerequisites
  bash -n "$0"
  python3 -m py_compile "$UPDATER"
  python3 -m py_compile "$DATA_VALIDATOR"
  git -C "$REPO_ROOT" ls-remote --exit-code origin refs/heads/main >/dev/null
  log "prerequisites, syntax, source updater, and GitHub access are ready"
  exit 0
fi

exec 9>"$LOCK_PATH"
if ! flock -n 9; then
  log "another dashboard update is active; skipping"
  exit 0
fi

check_prerequisites
git -C "$REPO_ROOT" fetch --quiet origin main
BASE_COMMIT="$(git -C "$REPO_ROOT" rev-parse origin/main)"
RUN_DIR="$(mktemp -d /tmp/shadowcontext-intel.XXXXXX)"
git -C "$REPO_ROOT" worktree add --quiet --detach "$RUN_DIR" "$BASE_COMMIT"

log "refreshing official feeds from $BASE_COMMIT"
(
  cd "$RUN_DIR"
  python3 automation/update_threat_dashboard.py
  python3 automation/validate_threat_dashboard.py --baseline-root "$REPO_ROOT"
  BUNDLE_PATH="$SHARED_BUNDLE_PATH" bundle exec jekyll build >/dev/null
  ruby automation/validate_seo.rb "$RUN_DIR" "$RUN_DIR/_site"
)

mapfile -t CHANGED < <(git -C "$RUN_DIR" status --porcelain=v1 --untracked-files=all)
if [[ ${#CHANGED[@]} -eq 0 ]]; then
  log "dashboard already current"
  exit 0
fi
if [[ ${#CHANGED[@]} -gt 6 ]]; then
  log "rejected update touching more than the six generated data files"
  exit 1
fi
for line in "${CHANGED[@]}"; do
  path="${line:3}"
  case "$path" in
    _data/threat_dashboard.json|assets/data/daily-iocs.csv|assets/data/daily-file-hashes.txt|assets/data/daily-ip-addresses.txt|assets/data/daily-domains.txt|assets/data/daily-urls.txt) ;;
    *) log "rejected out-of-scope change: $line"; exit 1 ;;
  esac
done
git -C "$RUN_DIR" diff --check

git -C "$REPO_ROOT" fetch --quiet origin main
if [[ "$(git -C "$REPO_ROOT" rev-parse origin/main)" != "$BASE_COMMIT" ]]; then
  log "origin/main advanced during refresh; retrying on the next scheduled run"
  exit 0
fi

git -C "$RUN_DIR" add _data/threat_dashboard.json assets/data/daily-iocs.csv assets/data/daily-file-hashes.txt assets/data/daily-ip-addresses.txt assets/data/daily-domains.txt assets/data/daily-urls.txt
git -C "$RUN_DIR" -c user.name=shadowcontext-intel-bot -c user.email=shadowcontext-intel-bot@users.noreply.github.com commit --quiet -m "Refresh daily threat intelligence dashboard"
git -C "$RUN_DIR" push --quiet origin HEAD:main
log "published daily threat dashboard refresh"
