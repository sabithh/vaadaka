from rest_framework import serializers
from apps.bookings.models import Booking, Notification
from apps.vaadaka.serializers import VaadakaSerializer
from apps.shops.serializers import ShopSerializer
from apps.users.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    
    renter = UserSerializer(read_only=True)
    vaadaka = VaadakaSerializer(read_only=True)
    shop = ShopSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'renter', 'vaadaka', 'shop', 'quantity',
            'start_datetime', 'end_datetime', 'duration_hours',
            'rental_price', 'deposit_amount', 'total_amount',
            'status', 'payment_status', 'payment_method',
            'razorpay_order_id', 'razorpay_payment_id',
            'pickup_time', 'return_time', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'renter', 'duration_hours', 'total_amount',
            'razorpay_order_id', 'razorpay_payment_id',
            'created_at', 'updated_at'
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    
    vaadaka_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'vaadaka_id', 'quantity', 'start_datetime', 'end_datetime',
            'rental_price', 'deposit_amount', 'payment_method', 'notes'
        ]
    
    def validate(self, attrs):
        """Validate booking data"""
        vaadaka_id = attrs.get('vaadaka_id')
        quantity = attrs.get('quantity', 1)
        start_time = attrs.get('start_datetime')
        end_time = attrs.get('end_datetime')
        
        # Validate vaadaka exists
        from apps.vaadaka.models import Vaadaka
        try:
            vaadaka = Vaadaka.objects.select_related('shop__owner').get(id=vaadaka_id)
        except Vaadaka.DoesNotExist:
            raise serializers.ValidationError({'vaadaka_id': 'Vaadaka not found'})
        
        # Prevent self-booking — provider cannot book their own vaadaka
        renter = self.context['request'].user
        if vaadaka.shop.owner == renter:
            raise serializers.ValidationError({'vaadaka_id': 'You cannot book your own vaadaka'})
        
        # Validate quantity
        if vaadaka.quantity_available < quantity:
            raise serializers.ValidationError({
                'quantity': f'Only {vaadaka.quantity_available} available'
            })
        
        # Validate dates are not in the past
        from django.utils import timezone
        if start_time < timezone.now():
            raise serializers.ValidationError({
                'start_datetime': 'Start date cannot be in the past'
            })
        
        # Validate dates
        if start_time >= end_time:
            raise serializers.ValidationError({
                'end_datetime': 'End time must be after start time'
            })
        
        attrs['vaadaka'] = vaadaka
        attrs['shop'] = vaadaka.shop
        
        return attrs

    
    def create(self, validated_data):
        """Create booking and atomically decrement vaadaka quantity"""
        from django.db import transaction
        from django.db.models import F
        from apps.vaadaka.models import Vaadaka

        vaadaka_id = validated_data.pop('vaadaka_id')
        vaadaka = validated_data['vaadaka']
        quantity = validated_data['quantity']

        with transaction.atomic():
            updated = Vaadaka.objects.filter(
                id=vaadaka.id,
                quantity_available__gte=quantity
            ).update(quantity_available=F('quantity_available') - quantity)

            if not updated:
                raise serializers.ValidationError({
                    'quantity': 'Vaadaka is no longer available in requested quantity'
                })

            validated_data['renter'] = self.context['request'].user
            booking = super().create(validated_data)

        # Notify the shop owner of the new booking request
        try:
            from apps.users.notifications import send_push
            Notification.objects.create(
                user=booking.shop.owner,
                type='booking',
                title='New Booking Request',
                message=f'{booking.renter.username} requested to rent {booking.vaadaka.name}.'
            )
            send_push(
                booking.shop.owner,
                'New Booking Request',
                f'{booking.renter.username} wants to rent {booking.vaadaka.name}.',
                data={'type': 'booking', 'booking_id': str(booking.id)},
            )
        except Exception:
            pass

        return booking


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'title', 'message',
            'is_read', 'related_object_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
