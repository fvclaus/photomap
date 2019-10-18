from more_itertools import partition


def configure_whitenoise(config):
    not_security_middleware, security_middleware = partition(
        lambda item: "security" in item.lower(), config['MIDDLEWARE'])

    config['MIDDLEWARE'] = list(security_middleware) + \
        ['whitenoise.middleware.WhiteNoiseMiddleware'] + \
        list(not_security_middleware)

    # Configuration for whitenoise
    config['STATIC_ROOT'] = config['STATIC_PATH']
    config['STATICFILES_STORAGE'] = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
