#!/bin/bash
set -e

sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -i -u postgres bash <<END
createdb $DB_NAME
psql -d $DB_NAME -c "CREATE USER $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD' SUPERUSER;"
psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
END
psql --version