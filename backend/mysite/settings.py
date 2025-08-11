"""
Django settings for mysite project.
"""

import os
import dj_database_url
from pathlib import Path
from datetime import timedelta


BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = os.environ.get('DJANGO_DEBUG', 'True').lower() in ['true', '1', 'yes']

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("DJANGO_SECRET_KEY must be set in production!")
        

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
    'django_cryptography'
]

if DEBUG:
    INSTALLED_APPS.append('debug_toolbar')

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

PREVIEW_PASSWORD = os.environ.get('PREVIEW_PASSWORD', '2025!')

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
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    } 


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
MEDIA_ROOT = BASE_DIR / 'media'

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
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'COERCE_DECIMAL_TO_STRING': False,
}

# Configuration pour Azure et Render
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS = [
        RENDER_EXTERNAL_HOSTNAME,
        '18.156.158.53',  # IP Render
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
    ]
else:
    ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,192.168.1.184,18.156.158.53').split(',')

if DEBUG:
    # Configuration HTTP pour le développement  
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:8000",
        "http://localhost:5173", 
        "http://127.0.0.1:8000",
        "http://127.0.0.1:5173",
        "http://192.168.1.184:5173",  # Adresse réseau local si nécessaire
    ]
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_SSL_REDIRECT = False
else:
    # Production 
    CORS_ALLOW_ALL_ORIGINS = True

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
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=int(os.environ.get('ACCESS_TOKEN_LIFETIME', '2'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(hours=int(os.environ.get('REFRESH_TOKEN_LIFETIME', '24'))),
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
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')


# Configuration Email

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')

DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@hoolis.com')