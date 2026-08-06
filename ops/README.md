# Arandi Platform Operations

Production target:

- Ubuntu 24.04
- `/srv/arandi-platform/releases/<release-id>` immutable source/build releases
- `/srv/arandi-platform/current` atomic active-release symlink
- `/srv/arandi-platform/shared/media` persistent Media storage
- The platform root, shared parent, and Media storage are owned by `arandi:www-data` with mode `0750`; sensitive child directories keep stricter owners, while Nginx can traverse only the Media path.
- `/srv/arandi-platform/backups` root-only database and Media backups
- `/etc/arandi-platform/app.env` root-owned runtime environment
- Node standalone server on `127.0.0.1:3000`
- staging Nginx listener on `127.0.0.1:8080`
- optional staging TLS listener on `127.0.0.1:8443`; its self-signed certificate validates the TLS/Nginx boundary only and is not a production certificate

The existing WordPress site under `/var/www/arandi.ir` and its port-80 Nginx server are not deployment targets. The staging listener must pass health, SEO, accessibility, responsive, and application verifiers before a separate cutover changes the public `arandi.ir` server block.

## Required environment

Create `/etc/arandi-platform` as `root:arandi` with mode `0750`. Copy `ops/env/app.env.example` to `/etc/arandi-platform/app.env`, set mode `0640`, owner `root:arandi`, and replace every `CHANGE_ME` value. Never place the resulting file in Git, release archives, logs, or `.ai`.

`/etc/arandi-platform/pgpass` is used only by backup automation:

```text
127.0.0.1:5432:arandi_platform:arandi_user:CHANGE_ME
```

It must be owned by root with mode `0600`.

## Release

1. Run CI and local validation.
2. Transfer a secret-free source archive to a root-only temporary directory on the VPS. After extraction, run `chown -R root:root <source-directory>` and `chmod -R go-w <source-directory>`; deployment rejects an unsafe source tree.
3. As root, run `bash ops/scripts/deploy.sh <source-directory> <release-id>`.
4. Verify `curl --fail http://127.0.0.1:8080/api/health/ready`.
5. Execute production-like UI/SEO/accessibility QA through an SSH tunnel or host override.
6. Cut over Nginx only after a valid certificate and rollback checkpoint exist.

The deploy script creates a backup before migrations, builds on Linux, switches the symlink atomically, restarts systemd, and automatically restores the previous application symlink if readiness fails. Prisma migrations are forward-only; application rollback does not reverse a migration.

## Recovery

- `ops/scripts/rollback.sh [release-id]` switches the application symlink and requires readiness to pass.
- `ops/scripts/backup.sh` writes checksummed PostgreSQL and Media archives.
- `ops/scripts/restore-verify.sh <database-dump>` restores into an isolated temporary database, verifies core table access, and drops it. It never targets the production database.
- Off-host encrypted backup replication remains required; local backups alone do not protect against VPS loss.
- Application and health-monitor output is retained in journald with the bounded policy in `ops/journald/arandi-platform.conf`; an external alert destination remains provider-dependent.

## Security gates

- No production service runs as root.
- PostgreSQL application credentials have no superuser, role, or database-creation privileges.
- Nginx is the only public application entry point.
- Media uploads require `clamdscan` in production.
- Password SSH must not be disabled until a separately stored public-key login is tested.
- TLS/HSTS must not be claimed until the actual certificate, renewal timer, and HTTPS redirect are exercised.
- Public DNS currently has to point at the VPS before ACME issuance and the final port-80/443 cutover can be approved.
