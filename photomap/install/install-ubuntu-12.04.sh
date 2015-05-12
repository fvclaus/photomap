# Install dependencies for native code
# For PIL:
sudo apt-get install libjpeg-dev libfreetype6 libfreetype6-dev zlib1g-dev
# For Postgres:
sudo apt-get install libpq-dev
# Create a virtualenv and install the python dependencies.
pip install -r requirements.txt


# For GAE:
# Create dummy virtualenv (seperate from the other one)
# Download google_appengine_django and unzip it to somewhere (the path must not be changed later)
# Change into the parent folder install (unpack) django for GAE:
pip install --build google_appengine_django/ --target appengine_django/ [i.e the path to different(!) folder] --no-download djangoappengine django-autoload django-dbindexer django-filetransfers django-nonrel djangotoolbox
# The target folder path must be added to environment.py as a variable called DJANGO_EGGS_DIR.

# Create another folder called appengine_python and change into that folder.
# Download and install dependencies in the current folder:
# Stuff like PIL, psycopg and django and standard python modules like argparse or wsgiref can be ignored.
# All dependencies that must be uploaded to GAE should be marked in the requirements.txt
# This command filters the necessary dependencies and creates a new requirements file.
cat [path to requirements.txt]  | grep "GAE$" > requirements.txt
pip install --target . --requirement requirements.txt
# Remove the requirements file, otherwise it will be symbollically linked.
rm requirements.txt
# Add the folder to your environment.py as a variable called PYTHON_EGGS_DIR
# Back in the project folder execute 
