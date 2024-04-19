#!/usr/bin/bash

# refresh the cache at startup
su -c "php artisan config:cache" -s /bin/bash www-data
su -c "php artisan route:cache" -s /bin/bash www-data

# the server
apache2-foreground
