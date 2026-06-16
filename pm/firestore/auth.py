"""
Firebase Authentication middleware and user class.

Replaces Django's session/DB-based auth with stateless Firebase ID token verification.
The frontend sends the Firebase ID token as the 'Authorization: Bearer <token>' header
or as a session cookie named 'firebase_token'.
"""

import logging

from firebase_admin import auth as firebase_auth
from django.utils.functional import SimpleLazyObject

from .client import get_app
from .models import UserProfile

logger = logging.getLogger(__name__)

SESSION_COOKIE_NAME = "firebase_token"


class FirebaseUser:
    """
    A user object populated from a verified Firebase ID token.
    Provides enough of Django's User interface to work with login_required,
    request.user, etc.
    """

    def __init__(self, uid, email, token_data=None):
        self.uid = uid
        self.pk = uid
        self.id = uid
        self.email = email
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
        self.is_staff = False
        self.is_superuser = False
        self._token_data = token_data or {}
        self._userprofile = None

    @property
    def userprofile(self):
        if self._userprofile is None:
            self._userprofile, _ = UserProfile.objects.get_or_create(
                uid=self.uid, email=self.email
            )
        return self._userprofile

    def __eq__(self, other):
        if isinstance(other, FirebaseUser):
            return self.uid == other.uid
        return False

    def __str__(self):
        return self.email


class AnonymousFirebaseUser:
    """Represents an unauthenticated user."""

    uid = None
    pk = None
    id = None
    email = ""
    is_authenticated = False
    is_active = False
    is_anonymous = True
    is_staff = False
    is_superuser = False


def get_firebase_user(request):
    """Verify the Firebase token from the request and return a FirebaseUser."""
    token = None

    # Try Authorization header first
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]

    # Fall back to session cookie
    if not token:
        token = request.COOKIES.get(SESSION_COOKIE_NAME)

    if not token:
        return AnonymousFirebaseUser()

    try:
        get_app()
        decoded = firebase_auth.verify_id_token(token)
        return FirebaseUser(
            uid=decoded["uid"],
            email=decoded.get("email", ""),
            token_data=decoded,
        )
    except Exception as e:
        logger.debug("Firebase token verification failed: %s", e)
        return AnonymousFirebaseUser()


class FirebaseAuthMiddleware:
    """
    Middleware that sets request.user to a FirebaseUser based on the
    Firebase ID token in the request. Replaces Django's AuthenticationMiddleware.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user = SimpleLazyObject(lambda: get_firebase_user(request))
        return self.get_response(request)


class FirebaseLoginRequired:
    """
    View decorator equivalent to Django's login_required but for Firebase auth.
    Usage: @firebase_login_required
    """

    def __init__(self, view_func):
        self.view_func = view_func

    def __call__(self, request, *args, **kwargs):
        from django.conf import settings
        from django.http import HttpResponseRedirect
        if not request.user.is_authenticated:
            return HttpResponseRedirect(settings.LOGIN_URL)
        return self.view_func(request, *args, **kwargs)


def firebase_login_required(view_func):
    return FirebaseLoginRequired(view_func)
