# Install virtualenv
pip3 install --user virtualenv
# Add to path
export PY_USER_BIN=$(python -c 'import site; print(site.USER_BASE + "/bin")')
export PATH=$PY_USER_BIN:$PATH
# Create virtualenv
virtualenv -p /usr/bin/python3 photomap-env
# Activate virtualenv
source photomap-env/bin/activate
# Install dependencies
pip3 install -r requirements.txt

Create database:
CREATE USER photomap WITH LOGIN PASSWORD '$password';
CREATE DATABASE photomap WITH OWNER photomap;


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

# Start server on port 8080 (GAE uses same port)
python manage.py runserver 8080


# Connect to app engine db:
./cloud_sql_proxy -instances="keiken-208312:europe-west3:keikensql"=tcp:3306
# In other tab:
mysql --host 127.0.0.1 --user root  --password

# Copy the django 1.9 release folders (dojo, dijit and dijitx) to src/static/js
python manage.py compress --settings=settings_prod --verbose 3

# Simulate production environment (Django does not serve static files in production):
dev_appserver.py app.yaml

# Create dojo build:
~/install/dojo-release-1.9.11-src/util/buildscripts/build.sh --profile build.profile.js
