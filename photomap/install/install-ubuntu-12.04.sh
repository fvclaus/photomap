# Install dependencies for native code
# For PIL:
sudo apt-get install libjpeg-dev libfreetype6 libfreetype6-dev zlib1g-dev
# For Postgres:
sudo apt-get install libpq-dev
# Create a virtualenv and install the python dependencies.
pip install -r requirements.txt


# For GAE:
# Change to a directory you would like to install all dependencies. This should be a stable path you are not very likely to change later.
# Create dummy virtualenv (seperate from the other one)
virtualenv installenv --no-site-packages
# Create a folder that stores all project dependencies
mkdir appengine_keiken
# Download google_appengine_django.zip and unzip it to the current folder.
# Install the django dependencies into the newly created folder:
pip install --build google_appengine_django/ --target appengine_keiken/ --no-download djangoappengine django-autoload django-dbindexer django-filetransfers django-nonrel djangotoolbox
# The target folder path must be added to environment.py as a variable called DJANGO_EGGS_DIR.
echo "DJANGO_EGGS_DIR = \"[path to appengine_django]\"" >> [path to environment.py]

# Download and install dependencies into the new folder:
# Stuff like PIL, psycopg and django and standard python modules like argparse or wsgiref can be ignored.
# All dependencies that must be uploaded to GAE should be marked in the requirements.txt
# This command filters the necessary dependencies and creates a new requirements file.
cat [path to requirements.txt]  | grep "GAE$" > requirements.txt
pip install --target appengine_keiken --requirement requirements.txt
# Remove the requirements file, you don't need that anymore.
rm requirements.txt
# Add the folder to your environment.py as a variable called PYTHON_EGGS_DIR
# Back in the project folder execute 
