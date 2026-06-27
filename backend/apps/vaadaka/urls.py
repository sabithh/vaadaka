from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VaadakaViewSet, VaadakaCategoryViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'vaadakas', VaadakaViewSet, basename='vaadaka')
router.register(r'categories', VaadakaCategoryViewSet, basename='category')
router.register(r'reviews', ReviewViewSet, basename='review')

urlpatterns = [
    path('', include(router.urls)),
]
