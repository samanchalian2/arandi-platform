#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $# -ne 2 ]]; then
  printf 'Usage: %s <source-directory> <release-id>\n' "$0" >&2
  exit 64
fi

source_directory="$(realpath "$1")"
release_id="$2"
base="/srv/arandi-platform"
release_directory="${base}/releases/${release_id}"
previous_target="$(readlink -f "${base}/current" 2>/dev/null || true)"
environment_file="/etc/arandi-platform/app.env"

if [[ ! "${release_id}" =~ ^[A-Za-z0-9._-]{1,80}$ ]]; then
  printf 'Release id is invalid.\n' >&2
  exit 64
fi
test -f "${source_directory}/package-lock.json"
test -f "${source_directory}/prisma/schema.prisma"
test -f "${environment_file}"
if [[ -n "$(find "${source_directory}" \( ! -user root -o -perm /022 \) -print -quit)" ]]; then
  printf 'Source tree must be root-owned and not group/world-writable.\n' >&2
  exit 1
fi
if [[ -e "${release_directory}" ]]; then
  printf 'Release already exists: %s\n' "${release_id}" >&2
  exit 1
fi

install -d -m 0750 -o arandi -g www-data "${base}"
install -d -m 0750 -o arandi -g arandi "${base}/releases"
install -d -m 0750 -o arandi -g www-data "${base}/shared"
install -d -m 0750 -o arandi -g arandi "${base}/shared/cache"
install -d -m 0750 -o arandi -g www-data "${base}/shared/media"
install -d -m 0700 -o root -g root "${base}/backups"
install -d -m 0750 -o arandi -g arandi "${release_directory}"

rsync -a \
  --exclude='.ai/' \
  --exclude='.env*' \
  --exclude='.git/' \
  --exclude='.next/' \
  --exclude='node_modules/' \
  --exclude='storage/' \
  "${source_directory}/" "${release_directory}/"
chmod 0750 "${release_directory}"/ops/scripts/*.sh
chown -R arandi:arandi "${release_directory}"

bash "${release_directory}/ops/scripts/backup.sh"

pushd "${release_directory}" >/dev/null
sudo -u arandi npm ci --ignore-scripts
sudo -u arandi npm rebuild sharp @prisma/client
sudo -u arandi bash -c 'set -a; source /etc/arandi-platform/app.env; set +a; npm exec -- prisma generate'
sudo -u arandi bash -c 'set -a; source /etc/arandi-platform/app.env; set +a; npm exec -- prisma migrate deploy'
sudo -u arandi bash -c 'set -a; source /etc/arandi-platform/app.env; set +a; npm run build'
popd >/dev/null

# Prisma migrations can change public CMS data without a corresponding Admin
# mutation. The Next data cache is intentionally shared across releases, so
# invalidate its disposable fetch cache before activating the new release.
rm -rf -- "${base}/shared/cache/fetch-cache"
install -d -m 0750 -o arandi -g arandi "${base}/shared/cache/fetch-cache"

install -d -m 0750 -o arandi -g arandi "${release_directory}/.next/standalone/.next"
if [[ -d "${release_directory}/public" ]]; then
  cp -a "${release_directory}/public" "${release_directory}/.next/standalone/public"
fi
cp -a "${release_directory}/.next/static" "${release_directory}/.next/standalone/.next/static"
cp -a "${release_directory}/ops" "${release_directory}/.next/standalone/ops"
rm -rf -- "${release_directory}/.next/standalone/.next/cache"
ln -s "${base}/shared/cache" "${release_directory}/.next/standalone/.next/cache"
chown -R arandi:arandi "${release_directory}/.next/standalone"

ln -sfn "${release_directory}/.next/standalone" "${base}/current"
systemctl restart arandi-platform.service

if ! "${base}/current/ops/scripts/healthcheck.sh"; then
  if [[ -n "${previous_target}" ]]; then
    ln -sfn "${previous_target}" "${base}/current"
    systemctl restart arandi-platform.service
  fi
  printf 'Release failed readiness and application symlink was rolled back.\n' >&2
  exit 1
fi

printf 'Release activated: %s\n' "${release_id}"
