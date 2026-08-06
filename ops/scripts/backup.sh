#!/usr/bin/env bash
set -Eeuo pipefail

backup_root="/srv/arandi-platform/backups"
media_root="/srv/arandi-platform/shared/media"
pgpass_file="/etc/arandi-platform/pgpass"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
staging_directory="${backup_root}/.${timestamp}.partial"
final_directory="${backup_root}/${timestamp}"

install -d -m 0700 -o root -g root "${backup_root}"
install -d -m 0700 -o root -g root "${staging_directory}"
test -f "${pgpass_file}"
test "$(stat -c '%a' "${pgpass_file}")" = "600"

PGPASSFILE="${pgpass_file}" pg_dump \
  --host=127.0.0.1 \
  --port=5432 \
  --username=arandi_user \
  --dbname=arandi_platform \
  --format=custom \
  --file="${staging_directory}/database.dump"

if [[ -d "${media_root}" ]]; then
  tar --create --gzip --file="${staging_directory}/media.tar.gz" --directory="${media_root}" .
else
  tar --create --gzip --file="${staging_directory}/media.tar.gz" --files-from=/dev/null
fi

(
  cd "${staging_directory}"
  sha256sum database.dump media.tar.gz > SHA256SUMS
)
chmod 0600 "${staging_directory}"/*
mv "${staging_directory}" "${final_directory}"

find "${backup_root}" -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf -- {} +
printf 'Backup completed: %s\n' "${final_directory}"
