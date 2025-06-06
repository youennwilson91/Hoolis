class ForceCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Force les headers CORS si ils sont manquants
        origin = request.META.get('HTTP_ORIGIN')
        
        if origin and origin in ['https://hoolis.vercel.app', 'https://hoolis-api.onrender.com']:
            if not response.get('Access-Control-Allow-Origin'):
                response['Access-Control-Allow-Origin'] = origin
            if not response.get('Access-Control-Allow-Credentials'):
                response['Access-Control-Allow-Credentials'] = 'true'
            if not response.get('Access-Control-Allow-Methods'):
                response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            if not response.get('Access-Control-Allow-Headers'):
                response['Access-Control-Allow-Headers'] = 'Accept, Content-Type, Origin, Authorization, X-Requested-With, X-CSRFToken'
        
        return response 