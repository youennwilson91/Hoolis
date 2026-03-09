"""
Django settings for mysite project.
"""

import os
import dj_database_url
from pathlib import Path
from datetime import timedelta
import environ

# Workaround pour djoser avec Django 4.0+
# baseconv a été supprimé de django.utils dans Django 4.0
try:
    from django.utils import baseconv
except ImportError:
    import sys
    from django.utils import encoding
    
    class BaseConverter:
        def __init__(self, digits):
            self.digits = digits
            self.base = len(digits)
        
        def encode(self, num):
            if num == 0:
                return self.digits[0]
            result = ''
            while num:
                num, remainder = divmod(num, self.base)
                result = self.digits[remainder] + result
            return result
        
        def decode(self, s):
            num = 0
            for char in s:
                num = num * self.base + self.digits.index(char)
            return num
    
    class BaseConvModule:
        BASE36_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'
        BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
        base36 = BaseConverter(BASE36_ALPHABET)
        base62 = BaseConverter(BASE62_ALPHABET)
    
    import django.utils
    django.utils.baseconv = BaseConvModule()
    sys.modules['django.utils.baseconv'] = BaseConvModule()



BASE_DIR = Path(__file__).resolve().parent.parent

# Environment variables - doit être défini en premier
env = environ.Env(
    LOG_LEVEL=(str, 'INFO'),
    ALLOW_REGISTRATION=(bool, True)
)
environ.Env.read_env(BASE_DIR / '.env')

DEBUG = env.bool('DJANGO_DEBUG', default=False)

SECRET_KEY = env('DJANGO_SECRET_KEY', default='django-insecure-dev-only-key' if DEBUG else None)
if not SECRET_KEY:
    raise ValueError("DJANGO_SECRET_KEY is required in production")
        

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'store.apps.StoreConfig',
    'tags.apps.TagsConfig',
    'core.apps.CoreConfig',
    'rest_framework',
    'rest_framework_nested',
    'django_filters',
    'djoser',
    'corsheaders',
    'django_extensions',
    'django_cryptography',
]

if DEBUG:
    INSTALLED_APPS.append('debug_toolbar')

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'mysite.middleware.DisableCSRFMiddleware',  # AVANT CsrfViewMiddleware
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Exemption CSRF pour les webhooks externes
CSRF_TRUSTED_ORIGINS = env.list('CSRF_TRUSTED_ORIGINS', default=[])
if not DEBUG:
    CSRF_TRUSTED_ORIGINS.extend(env.list('CORS_ALLOWED_ORIGINS', default=[]))

PREVIEW_PASSWORD = env('PREVIEW_PASSWORD', default=None)

if DEBUG:
    MIDDLEWARE.append('debug_toolbar.middleware.DebugToolbarMiddleware')

ROOT_URLCONF = 'mysite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',  # Templates Django (emails, etc.)
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]




DATABASES = {
    'default': env.db('DATABASE_URL')
}

# Options SQL Server (seulement si c'est mssql)
if DATABASES['default'].get('ENGINE') == 'mssql' or 'mssql' in str(DATABASES['default'].get('ENGINE', '')):
    DATABASES['default'].setdefault('OPTIONS', {}).update({
        'driver': 'ODBC Driver 17 for SQL Server',
        'extra_params': 'TrustServerCertificate=yes',
    }) 


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Configuration pour servir les assets React
STATICFILES_DIRS = [
    BASE_DIR.parent / 'frontend' / 'dist' / 'assets',  # Assets générés par Vite
    BASE_DIR.parent / 'frontend' / 'dist',  # Autres fichiers statiques (images, etc.)
]
MEDIA_URL = '/media/'
MEDIA_ROOT = env('MEDIA_ROOT', default=str(BASE_DIR / 'media'))

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

if DEBUG:
    INTERNAL_IPS = ['127.0.0.1']

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    #'DEFAULT_PERMISSION_CLASSES': [
    #    'rest_framework.permissions.IsAuthenticated',
    #],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # 100 requêtes par heure pour les anonymes
        'user': '1000/hour',  # 1000 requêtes par heure pour les authentifiés
        'payment': '10/hour',  # 10 tentatives de paiement par heure par IP
        'burst': '20/min',  # 20 requêtes par minute (burst protection)
    },
    'COERCE_DECIMAL_TO_STRING': False,
}

# Configuration pour Azure et Render
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')

if DEBUG:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '192.168.1.184', 'prod-hoolis-fbackend.onrender.com']
else:
    ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])
    if RENDER_EXTERNAL_HOSTNAME:
        ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

if DEBUG:
    # Configuration HTTP pour le développement
    CORS_ALLOW_ALL_ORIGINS = True
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_SSL_REDIRECT = False
else:
    # Production - CORS restreint
    CORS_ALLOW_ALL_ORIGINS = False
    CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[])

    # Production settings - full HTTPS enforcement
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

AUTH_USER_MODEL = 'core.User'

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# Configuration CORS robuste
CORS_ALLOW_CREDENTIALS = True


# Permettre toutes les méthodes HTTP
CORS_ALLOWED_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
# Permettre tous les headers nécessaires
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Durée de cache pour les requêtes preflight
CORS_PREFLIGHT_MAX_AGE = 86400

# Permettre les headers d'exposition
CORS_EXPOSE_HEADERS = [
    'Content-Type',
    'X-CSRFToken',
]

# Bypass CORS check pour certaines URLs (notamment pour les OPTIONS requests)
CORS_URLS_REGEX = r'^.*$'

SIMPLE_JWT = {
    'AUTH_HEADER_TYPES': ('Bearer', 'JWT'),
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=env.int('ACCESS_TOKEN_LIFETIME', default=2)),
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=env.int('REFRESH_TOKEN_LIFETIME', default=24)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
}

DJOSER = {
    'SERIALIZERS': {
        'user_create': 'core.serializers.UserCreateSerializer',
        'user': 'core.serializers.UserSerializer',
        'current_user': 'core.serializers.UserSerializer',
    },
}

# Configuration Stripe
STRIPE_PUBLISHABLE_KEY = env('STRIPE_PUBLISHABLE_KEY', default=None)
STRIPE_SECRET_KEY = env('STRIPE_SECRET_KEY', default=None)
STRIPE_WEBHOOK_SECRET = env('STRIPE_WEBHOOK_SECRET', default=None)

# Configuration Celery + Redis (Upstash)
import ssl

CELERY_BROKER_URL = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_BROKER_USE_SSL = {'ssl_cert_reqs': ssl.CERT_NONE}
CELERY_REDIS_BACKEND_USE_SSL = {'ssl_cert_reqs': ssl.CERT_NONE}
CELERY_TASK_SERIALIZER = 'json'
CELERY_ACCEPT_CONTENT = ['json']

# Configuration Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default=None)
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default=None)
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default=None)

# URL du frontend pour les redirections Stripe
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:5173')

