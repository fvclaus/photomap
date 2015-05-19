##########################################################################################
# Environment setup
##########################################################################################

# 1. Local setup
# Install dependencies for native code
# For PIL:
sudo apt-get install libjpeg-dev libfreetype6 libfreetype6-dev zlib1g-dev
# For Postgres:
sudo apt-get install libpq-dev
# Create a virtualenv
virtualenv keikenenv --no-site-packages
# Install the python dependencies.
pip install -r requirements.txt
# Installing stylus. Stylus preprocesses our css.
# Stylus requires node, so you might have to install that.
# I would install nvm first. It can be installed with a curl script.
# https://github.com/creationix/nvm
# Install some up-to-date version of node.
# I installed 0.12.3
nvm install v0.12.3
# Node comes with a version of npm installed.
# You can execute npm root to see where npm will install modules.
# It is recommended not to install node modules with sudo,
# rather install them in your home directory.
# This can be achieved by install node with nvm
# and then installing stylus with
npm install -g stylus
# It is important that the stylus command is in your PATH,
# so that django can find it. You can test this, by running
stylus --version
# We also use jslint to check javascript files.
# You can install it like this:
npm install -g jslint


# 2. Setup with GAE (only if you want to test on GAE or deploy to GAE)
# Change to a directory you would like to install all dependencies. This should be a stable path you are not very likely to change later.
# Create dummy virtualenv (seperate from the other one)
virtualenv installenv --no-site-packages
# Create a folder that stores all project dependencies
mkdir appengine_keiken
# Download google_appengine_django.zip and unzip it to the current folder.
# Install the django dependencies into the newly created folder:
pip install --build google_appengine_django/ --target appengine_keiken/ --no-download djangoappengine django-autoload django-dbindexer django-filetransfers django-nonrel djangotoolbox

# Download and install dependencies into the new folder:
# Stuff like PIL, psycopg and django and standard python modules like argparse or wsgiref can be ignored.
# All dependencies that must be uploaded to GAE should be marked in the requirements.txt
# This command filters the necessary dependencies and creates a new requirements file.
cat [path to requirements.txt]  | grep "GAE$" > requirements.txt
pip install --target appengine_keiken --requirement requirements.txt
# Remove the requirements file, you don't need that anymore.
rm requirements.txt
# It is probably a good idea to create a local git repository, just in case
# you add some debugging code in some python modules you can revert that more easily.
cd keiken_appengine; git init; git commit -a -m "Initial commit";
# The target folder path must be added to environment.py as a variable called APPENGINE_EGGS_DIR.
echo "APPENGINE_EGGS_DIR = \"[path to appengine_keiken]\"" >> [path to environment.py]
# In your project folder run
python prepare_gae.py
# This script will create symbolic links to the downloaded dependencies.


##########################################################################################
# Loading data
##########################################################################################

# Use settings=settings or settings=settings_appengine depending on your environment
# All data is stored in the .json fixtures
# Load the default users.
# Use devel-users.json for development and 
python manage.py loaddata pm/fixtures/devel-users.json --settings=[your settings file]
# Load the data for the demo album.
python manage.py loaddata pm/fixtures/demo-data.json --settings=[your settings file]


##########################################################################################
# Downloading dojo
##########################################################################################

# The javascript files require Dojo. Our current version can be downloaded here:
# http://www.wuala.com/fclaus/public/dojo-release-1.9.1-src.tar.gz/
# Extract the contents of the folder (the dijit/, dojo/ ...) folders to static/js.


#########################################################################################
# Running server in development (not GAE)
##########################################################################################

# That's it, the server should be ready now and can be started with
python manage.py runserver --settings=settings


#########################################################################################
# Running server with GAE
##########################################################################################

# GAE runs with production settings, therefore we must precompress css and javascript files
# and create a dojo deployment.
# Compressing with appengine settings does not work.
# In the project folder execute the following:
python manage.py compress --settings=settings
./static/js/util/buildscripts/build.sh --profile build.profile.js
# Now we can start the GAE server with
python manage.py runserver --settings=settings_appengine