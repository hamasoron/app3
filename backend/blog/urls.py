from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet, LikeViewSet, MatchViewSet, MessageViewSet, BlockViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'likes', LikeViewSet, basename='like')
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'blocks', BlockViewSet, basename='block')

urlpatterns = [
    path('', include(router.urls)),
]


