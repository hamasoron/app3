from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, LikeViewSet, MatchViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'likes', LikeViewSet, basename='like')
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]


