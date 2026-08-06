#!/usr/bin/env bash
set -Eeuo pipefail

curl \
  --fail \
  --silent \
  --show-error \
  --retry 15 \
  --retry-all-errors \
  --retry-delay 1 \
  --max-time 10 \
  http://127.0.0.1:3000/api/health/ready >/dev/null
