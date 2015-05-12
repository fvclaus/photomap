import os
import subprocess
import environment
import pdb
import re


if not os.path.isdir(environment.PYTHON_EGGS_DIR):
    print "{0} is not a directory.".format(environment.PYTHON_EGGS_DIR)
    exit(1)

if not os.path.isdir(environment.DJANGO_EGGS_DIR):
    print "{0} is not a directory.".format(environment.DJANGO_EGGS_DIR)
    exit(1)

print "Linking django eggs..."

DJANGO_EGGS = ["djangoappengine", "django-autoload", "django-dbindexer", "django-filetransfers", "django-nonrel", "djangotoolbox"]

def is_ignored_path(path):
    is_python_bytecode = path.endswith(".pyc")
    is_python_egg_info = path.endswith(".egg-info")
    is_python_dist_info = path.endswith(".dist-info")
    return  is_python_bytecode or is_python_egg_info or is_python_dist_info
    
def create_filesystem_link(path):
    egg = os.path.split(path)[1]
    link_path = os.path.join(os.getcwd(), egg)

    if not os.path.exists(path):
        print "{0} does not exists. Cannot create link to nonexisting directory/file.".format(path)
        exit(1)
    if is_ignored_path(path):
        print "Egg {0} is not a real egg and should be ignored. Skipping.".format(egg)
        return

    if not os.path.exists(link_path):
        subprocess.call(["ln", "-s", path, os.getcwd()])
    elif not os.path.islink(link_path):
        print "{0} is not a symbolic link.".format(egg)    
    else:
        print "Skipping {0}. Link already exists.".format(egg)

for egg in DJANGO_EGGS:
    path = os.path.join(environment.DJANGO_EGGS_DIR, egg)
    if not os.path.isdir(path):
        print "Cannot find egg {0} in dir {1}.".format(egg, environment.DJANGO_EGGS_DIR)
        exit(1)
    print "Linking django egg {0}".format(egg)
    create_filesystem_link(path)


for egg in os.listdir(environment.PYTHON_EGGS_DIR):
    path = os.path.join(environment.PYTHON_EGGS_DIR, egg)
    print "Linking python egg {0}".format(egg)
    create_filesystem_link(path)


        




