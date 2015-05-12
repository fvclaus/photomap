# Install dependencies for native code
# For PIL:
sudo apt-get install libjpeg-dev libfreetype6 libfreetype6-dev zlib1g-dev
# For Postgres:
sudo apt-get install libpq-dev


# For GAE:
# Download and install dependencies in current folder:
pip install --target . --requirement [PATH TO requirements.txt]
