#!/usr/bin/env bash
set -Eeuo pipefail

base="/srv/arandi-platform"
target_release="${1:-}"
previous_target="$(readlink -f "${base}/current" 2>/dev/null || true)"

if [[ -z "${target_release}" ]]; then
  target_release="$(find "${base}/releases" -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r | sed -n '2p')"
fi
if [[ ! "${target_release}" =~ ^[A-Za-z0-9._-]{1,80}$ ]]; then
  printf 'A safe release id is required.\n' >&2
  exit 64
fi
target="${base}/releases/${target_release}/.next/standalone"
test -f "${target}/server.js"

ln -sfn "${target}" "${base}/current"
systemctl restart arandi-platform.service
if ! "${base}/current/ops/scripts/healthcheck.sh"; then
  if [[ -n "${previous_target}" ]]; then
    ln -sfn "${previous_target}" "${base}/current"
    systemctl restart arandi-platform.service
  fi
  printf 'Rollback target failed readiness.\n' >&2
  exit 1
fi
printf 'Rolled back to %s\n' "${target_release}"
