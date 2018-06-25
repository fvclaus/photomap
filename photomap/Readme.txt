virtualenv keiken-env
mkdir python_libs
pip install -t python_libs/ -r <(grep "GAE" install/requirements.txt)

# Required for mysql connector
sudo apt-get install python-dev libmariadbclient-dev

# Setup db:
CREATE DATABASE photomap;
CREATE USER 'photomap' IDENTIFIED BY '[MYSQL_PASSWORD]';
GRANT ALL ON photomap.* TO 'photomap';

# Install stylus (should be installed in home directory):
npm -g install stylus

# Create tables:
python manage.py syncdb -v 3

# Connect to app engine db:
./cloud_sql_proxy -instances="keiken-208312:europe-west3:keikensql"=tcp:3306
# In other tab:
mysql --host 127.0.0.1 --user root  --password

# Copy the django 1.9 release folders (dojo, dijit and dijitx) to src/static/js
python manage.py compress --settings=settings_prod

# Simulate production environment (Django does not serve static files in production):
dev_appserver.py app.yaml

# Create dojo build:
~/install/dojo-release-1.9.11-src/util/buildscripts/build.sh --profile build.profile.js
