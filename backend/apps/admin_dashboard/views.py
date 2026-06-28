from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from apps.vaadaka.models import Vaadaka
from apps.bookings.models import Booking
from apps.users.serializers import UserProfileSerializer
from apps.bookings.serializers import BookingSerializer
from apps.subscriptions.models import Subscription
from apps.vaadaka.serializers import VaadakaSerializer

User = get_user_model()


class IsSuperUser(permissions.BasePermission):
    """Allows access only to superusers."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]

    def get(self, request):
        total_users = User.objects.count()
        total_vaadakas = Vaadaka.objects.count()
        total_bookings = Booking.objects.count()

        total_revenue = Booking.objects.filter(
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        thirty_days_ago = timezone.now() - timedelta(days=30)
        new_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()
        new_bookings = Booking.objects.filter(created_at__gte=thirty_days_ago).count()

        return Response({
            'total_users': total_users,
            'total_vaadakas': total_vaadakas,
            'total_bookings': total_bookings,
            'total_revenue': total_revenue,
            'recent_activity': {
                'new_users': new_users,
                'new_bookings': new_bookings
            }
        })


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    http_method_names = ['get', 'delete', 'post', 'patch', 'head', 'options']

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.is_superuser:
            return Response({'error': 'Cannot delete a superuser.'}, status=status.HTTP_403_FORBIDDEN)
        user.delete()
        return Response({'success': True}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'])
    def vaadakas(self, request, pk=None):
        """Return all vaadakas listed by this user's shops."""
        user = self.get_object()
        try:
            shop_ids = user.shops.values_list('id', flat=True)
            vaadakas = Vaadaka.objects.filter(shop_id__in=shop_ids).select_related('shop', 'category').values(
                'id', 'name', 'price_per_day', 'is_available', 'shop__name', 'category__name'
            )
            return Response(list(vaadakas))
        except Exception:
            return Response([])

    @action(detail=True, methods=['get'])
    def subscription(self, request, pk=None):
        """Get subscription details for a provider user."""
        user = self.get_object()
        try:
            sub = user.subscriptions.order_by('-created_at').first()
            if sub:
                return Response({
                    'id': str(sub.id),
                    'status': sub.status,
                    'start_date': sub.start_date,
                    'end_date': sub.end_date,
                    'amount': str(sub.amount),
                })
            return Response(None)
        except Exception:
            return Response(None)

    @action(detail=True, methods=['patch'], url_path='subscription/edit')
    def edit_subscription(self, request, pk=None):
        """Grant or update subscription for a provider."""
        user = self.get_object()
        new_status = request.data.get('status')  # 'active' | 'expired'
        months = int(request.data.get('months', 1))

        if new_status not in ('active', 'expired', 'pending'):
            return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Expire all current active subscriptions
            user.subscriptions.filter(status='active').update(status='expired')

            # Create a new one
            sub = Subscription.objects.create(
                user=user,
                status=new_status,
                start_date=timezone.now(),
                end_date=timezone.now() + timedelta(days=30 * months) if new_status == 'active' else None,
                amount=0,  # Admin grant — no charge
            )
            return Response({
                'id': str(sub.id),
                'status': sub.status,
                'start_date': sub.start_date,
                'end_date': sub.end_date,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def toggle_verify(self, request, pk=None):
        user = self.get_object()
        user.is_verified = not user.is_verified
        user.save(update_fields=['is_verified'])
        return Response({'status': 'ok', 'is_verified': user.is_verified})

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response({'status': 'ok', 'is_active': user.is_active})

    @action(detail=True, methods=['post'])
    def toggle_staff(self, request, pk=None):
        user = self.get_object()
        if user.is_superuser:
            return Response({'error': 'Cannot change role of a superuser.'}, status=status.HTTP_403_FORBIDDEN)
        user.is_staff = not user.is_staff
        user.save(update_fields=['is_staff'])
        return Response({'status': 'ok', 'is_staff': user.is_staff})

    @action(detail=True, methods=['get'])
    def details(self, request, pk=None):
        user = self.get_object()
        user_data = UserProfileSerializer(user).data
        
        # Get Bookings (renter)
        bookings = Booking.objects.filter(renter=user).order_by('-created_at')
        bookings_data = BookingSerializer(bookings, many=True).data

        # Get Listings (provider)
        shop_ids = user.shops.values_list('id', flat=True)
        vaadakas = Vaadaka.objects.filter(shop_id__in=shop_ids).order_by('-created_at')
        vaadakas_data = VaadakaSerializer(vaadakas, many=True).data

        return Response({
            'user': user_data,
            'bookings': bookings_data,
            'listings': vaadakas_data,
        })


class AdminBookingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'vaadaka__name', 'renter__username', 'renter__email']


class AdminVaadakaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Vaadaka.objects.all().order_by('-created_at')
    serializer_class = VaadakaSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['id', 'name', 'category__name', 'shop__name']


class AdminProviderFinanceViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsSuperUser]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']

    def get_queryset(self):
        return User.objects.filter(user_type='provider').order_by('-date_joined')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            data = self._get_finance_data(page)
            return self.get_paginated_response(data)
        
        data = self._get_finance_data(queryset)
        return Response(data)

    def _get_finance_data(self, users):
        results = []
        for user in users:
            shops = user.shops.all()
            shop_ids = [shop.id for shop in shops]
            
            bookings = Booking.objects.filter(shop_id__in=shop_ids, payment_status='paid')
            total_revenue = bookings.aggregate(total=Sum('total_amount'))['total'] or 0
            total_fees = bookings.aggregate(total=Sum('platform_fee'))['total'] or 0
            
            unpaid_dues = total_fees
            try:
                from apps.payments.models import ProviderInvoice
                paid_invoices = ProviderInvoice.objects.filter(provider=user, status='paid').aggregate(total=Sum('total_due'))['total'] or 0
                unpaid_dues = max(0, total_fees - paid_invoices)
            except Exception:
                pass

            results.append({
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email,
                'total_shops': len(shop_ids),
                'total_bookings_handled': bookings.count(),
                'provider_revenue': float(total_revenue),
                'platform_fees_paid': float(total_fees - unpaid_dues),
                'unpaid_dues': float(unpaid_dues)
            })
        return results
