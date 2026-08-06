#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 1 ]]; then
  printf 'Usage: %s <database.dump>\n' "$0" >&2
  exit 64
fi

dump_file="$(realpath "$1")"
test -f "${dump_file}"
test -s "${dump_file}"

verify_database="arandi_restore_verify_$(date -u +%Y%m%d%H%M%S)"
verify_directory="/var/lib/postgresql/${verify_database}"
verify_dump="${verify_directory}/database.dump"
install -d -m 0700 -o postgres -g postgres "${verify_directory}"
install -m 0600 -o postgres -g postgres "${dump_file}" "${verify_dump}"
cleanup() {
  sudo -u postgres dropdb --if-exists "${verify_database}" >/dev/null
  rm -f -- "${verify_dump}"
  rmdir "${verify_directory}"
}
trap cleanup EXIT

sudo -u postgres createdb "${verify_database}"
sudo -u postgres pg_restore \
  --exit-on-error \
  --no-owner \
  --no-privileges \
  --dbname="${verify_database}" \
  "${verify_dump}"
sudo -u postgres psql \
  --dbname="${verify_database}" \
  --set=ON_ERROR_STOP=1 \
  --tuples-only \
  --command='SELECT count(*) FROM "Page"; SELECT count(*) FROM "_prisma_migrations";' \
  >/dev/null

printf 'Restore verification passed for %s\n' "${dump_file}"
