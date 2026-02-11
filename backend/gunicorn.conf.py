import os

# Configuration pour Render
bind = f"0.0.0.0:{os.environ.get('PORT', '10000')}"
workers = int(os.environ.get('WEB_CONCURRENCY', '1'))
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Security
forwarded_allow_ips = '10.16.195.131'  # IP du proxy Render (identifiée via test_ip)
secure_scheme_headers = {'X-FORWARDED-PROTO': 'https'} 