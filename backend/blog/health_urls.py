from django.urls import path
from django.http import JsonResponse
from django.db import connection


def health_check(request):
    """ヘルスチェックエンドポイント"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'matching-app'
    })


def readiness_check(request):
    """レディネスチェックエンドポイント"""
    try:
        # データベース接続確認
        connection.ensure_connection()
        return JsonResponse({
            'status': 'ready',
            'database': 'connected'
        })
    except Exception as e:
        return JsonResponse({
            'status': 'not ready',
            'error': str(e)
        }, status=503)


urlpatterns = [
    path('', health_check, name='health'),
    path('ready/', readiness_check, name='readiness'),
]


