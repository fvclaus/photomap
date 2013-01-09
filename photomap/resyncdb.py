'''
Created on Jan 9, 2013

@author: fredo
'''
import subprocess as sub
import sys
import argparse
import os
import threading
import errno
import select

if not os.path.exists("clear.sql"):
    print "Create a clear.sql file first. Exiting."
    exit(1)

parser = argparse.ArgumentParser(prog = "django resync database",
                                 description = "Resyncs the database with the default fixtures")
parser.add_argument("--production",
                    default = False,
                    action = "store_true",
                    help = "Use production instead of development scheme.")

parser = parser.parse_args()

MANAGE_PY = ["python", "manage.py"]
SYNCDB = MANAGE_PY + ["syncdb"]
DBSHELL = MANAGE_PY + ["dbshell"] 
SHELL = MANAGE_PY + ["shell"]
LOAD_FIXTURE = MANAGE_PY + ["loaddata"]


if not parser.production: 
    SETTINGS_MODULE = ["--settings=settings"]
    LOAD_USER = LOAD_FIXTURE + ["devel-user"]
    import settings
else: 
    SETTINGS_MODULE = ["--settings=settings_prod"]
    LOAD_USER = LOAD_FIXTURE + ["prod-user"]
    import settings_prod as settings

PASSWORD = settings.DATABASES["default"]["PASSWORD"]
print "Using settings module %s." % SETTINGS_MODULE


for CMD in [SYNCDB, DBSHELL, SHELL, LOAD_USER]:
    CMD += SETTINGS_MODULE

def drop_db():
#    p = sub.Popen(DBSHELL, shell = True, stdout = sub.PIPE, stdin = sub.PIPE)
    p = sub.Popen(DBSHELL, stdin = sub.PIPE, stdout = sub.PIPE)
    
    
    def communicate(cmd):
    
        poller = select.poll()
        select_POLLIN_POLLPRI = select.POLLIN | select.POLLPRI
        poller.register(p.stdin.fileno(), select.POLLOUT)
        poller.register(p.stdout.fileno(), select_POLLIN_POLLPRI)
        
        read = wrote = False
        
        while not read or not wrote:
            try:
                ready = poller.poll(5)
            except select.error, e:
                if e.args[0] == errno.EINTR:
                        continue
                raise
            
            if not ready:
                break
            
            for fd, mode in ready:
                print "Looking at %d, %d" % (fd, mode)
                if fd == p.stdin.fileno() and mode == select.POLLOUT and not wrote:
                    os.write(fd, cmd)
                    poller.unregister(fd)
                    wrote = True
                elif fd == p.stdout.fileno() and mode == select_POLLIN_POLLPRI and not read:
                    data = os.read(fd, 4096)
                    if not data:
                        poller.unregister(fd)
                        read = True
                        break
                    print data
                else:
                    poller.unregister(fd)
                    read = True
            
        
    
#    def _readerthread(fh):
# #        while True:
#        print dir(fh)
#        print "STDOUT: %s" % fh.read()
#
#
#    def communicate(input):
#
#        stdout_thread = threading.Thread(target = _readerthread, args = (p.stdout,))
#        stdout_thread.setDaemon(True)
#        stdout_thread.start()
#            
#        
#        try:
#            p.stdin.write(input)
#        except IOError as e:
#            if e.errno != errno.EPIPE:
#                raise
#                    
#        stdout_thread.join()
                    
    communicate("%s" % PASSWORD)
    print "Dropping all tables..."
    communicate("\i clear.sql\n")
    import time
    time.sleep(2)
    p.kill()
    print "Done. Closing dbshell."
            
#    p.stdin.write("%s\n" % PASSWORD)
#    print "Dropping all tables..."
#    p.stdin.write("\i clear.sql\n")
#    print "Done. Closing dbshell."
    communicate("\q\n")
    
    
    
def sync_db():
    print sub.check_output(SYNCDB)
    
def delete_user():
    p = sub.Popen(SHELL, stdin = sub.PIPE, stdout = sub.PIPE)
    print "Deleting all Users..."
    p.stdin.write("from django.contrib.auth.models import User\n")
    p.communicate("User.objects.all().delete()\n")
    print "Done. Closing shell."
    
def load_user():
    print sub.check_output(LOAD_USER)
    

drop_db()
sync_db()
delete_user()
load_user()
# print sub.check_output(SYNCDB, shell = True)
#
# p = sub.Popen(SHELL, shell = True, stdout = sub.PIPE, stdin = sub.PIPE)
# p.stdin.write("from geo.script.filldb import insertevaluation,insertall\n")
# # p.communicate("from geo.script.filldb import insertall\n")
# p.communicate("insertevaluation()")



