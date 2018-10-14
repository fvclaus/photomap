# ===============================================================================
# TESTS
# ===============================================================================
# Tests are spread over the test package.
#------------------------------------------------------------------------------ 

from pm import loadtests

# loads every definition from every module in the test package into the global namespace 
loadtests(nglobals = globals())





