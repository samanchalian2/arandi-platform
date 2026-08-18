#!/usr/bin/env bash
set -euo pipefail
ROOT=/srv/arandi-wordpress/site
REPO=/srv/arandi-wordpress/repo
DB=arandi_wordpress
USER=arandi_wp
for required in ARANDI_WP_DB_PASSWORD ARANDI_WP_ADMIN_USER ARANDI_WP_ADMIN_PASSWORD ARANDI_WP_ADMIN_EMAIL; do test -n "${!required:-}" || { echo "Missing $required"; exit 1; }; done
install -d -m 0750 -o www-data -g www-data "$ROOT"
if [ ! -f "$ROOT/wp-load.php" ]; then wp core download --path="$ROOT" --allow-root --locale=fa_IR; fi
mysql --protocol=socket -e "CREATE DATABASE IF NOT EXISTS \`${DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS '${USER}'@'localhost' IDENTIFIED BY '${ARANDI_WP_DB_PASSWORD}'; GRANT ALL PRIVILEGES ON \`${DB}\`.* TO '${USER}'@'localhost'; FLUSH PRIVILEGES;"
if [ ! -f "$ROOT/wp-config.php" ]; then wp config create --path="$ROOT" --dbname="$DB" --dbuser="$USER" --dbpass="$ARANDI_WP_DB_PASSWORD" --dbhost=localhost --skip-check --allow-root; fi
wp core is-installed --path="$ROOT" --allow-root || wp core install --path="$ROOT" --url='https://arandi.ir' --title='آرندی' --admin_user="$ARANDI_WP_ADMIN_USER" --admin_password="$ARANDI_WP_ADMIN_PASSWORD" --admin_email="$ARANDI_WP_ADMIN_EMAIL" --skip-email --allow-root
rsync -a --delete "$REPO/plugins/arandi-core/" "$ROOT/wp-content/plugins/arandi-core/"
rsync -a --delete "$REPO/themes/arandi-default-enterprise/" "$ROOT/wp-content/themes/arandi-default-enterprise/"
rsync -a --delete "$REPO/themes/arandi-scrollwise/" "$ROOT/wp-content/themes/arandi-scrollwise/"
wp theme install generatepress --path="$ROOT" --allow-root
wp plugin activate arandi-core --path="$ROOT" --allow-root
wp option update blogname 'آرندی' --path="$ROOT" --allow-root
wp rewrite structure '/%postname%/' --path="$ROOT" --allow-root
wp theme activate arandi-default-enterprise --path="$ROOT" --allow-root
wp arandi-core seed --path="$ROOT" --allow-root
chown -R www-data:www-data "$ROOT/wp-content"
