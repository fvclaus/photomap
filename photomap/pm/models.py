#===============================================================================
# MODELS
#===============================================================================
# models are spread over the model package
# every model must have a app_name in its Meta class otherwise it will be ignored 
#------------------------------------------------------------------------------ 


from pm import loadmodels

# only imports the module, not the definitions of the model
loadmodels()

