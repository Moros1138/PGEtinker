#!/usr/bin/bash

# refresh the cache at startup
su -c "php artisan config:clear" -s /bin/bash www-data
su -c "php artisan cache:clear" -s /bin/bash www-data
su -c "php artisan view:clear" -s /bin/bash www-data
su -c "php artisan route:clear" -s /bin/bash www-data

# nsjail/cgroup stuff
cgcreate -a www-data:www-data -g memory,pids,cpu:pgetinker-compile
sudo chown www-data:root /sys/fs/cgroup/cgroup.procs

# the server
apache2-foreground
