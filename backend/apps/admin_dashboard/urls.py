from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminStatsView, AdminUserViewSet, AdminBookingViewSet, AdminVaadakaViewSet

router = DefaultRouter()
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'bookings', AdminBookingViewSet, basename='admin-bookings')
router.register(r'vaadakas', AdminVaadakaViewSet, basename='admin-vaadakas')

urlpatterns = [
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('', include(router.urls)),
]
