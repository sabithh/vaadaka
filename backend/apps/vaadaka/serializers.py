from rest_framework import serializers
from .models import Vaadaka, VaadakaCategory, Review
from apps.shops.serializers import ShopSerializer


class VaadakaCategorySerializer(serializers.ModelSerializer):
    """Serializer for VaadakaCategory"""
    
    class Meta:
        model = VaadakaCategory
        fields = ['id', 'name', 'slug', 'icon', 'parent']


class VaadakaSerializer(serializers.ModelSerializer):
    """Serializer for Vaadaka model"""
    
    shop = ShopSerializer(read_only=True)
    category = VaadakaCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=VaadakaCategory.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Vaadaka
        fields = [
            'id', 'shop', 'category', 'category_id', 'name', 'description',
            'brand', 'model_number', 'condition', 'images',
            'quantity_available', 'quantity_total',
            'price_per_hour', 'price_per_day', 'price_per_week',
            'price_per_month', 'price_per_year',
            'minimum_rental_duration', 'deposit_amount',
            'specifications', 'is_available',
            'created_at', 'updated_at', 'in_stock'
        ]
        read_only_fields = ['id', 'shop', 'created_at', 'updated_at', 'in_stock']


class VaadakaCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating vaadakas"""
    
    class Meta:
        model = Vaadaka
        fields = [
            'category', 'name', 'description', 'brand', 'model_number',
            'condition', 'images', 'quantity_total', 'quantity_available',
            'price_per_hour', 'price_per_day', 'price_per_week',
            'price_per_month', 'price_per_year',
            'minimum_rental_duration', 'deposit_amount',
            'specifications', 'is_available'
        ]
        
    def validate(self, data):
        hour = data.get('price_per_hour')
        day = data.get('price_per_day')
        week = data.get('price_per_week')
        month = data.get('price_per_month')
        year = data.get('price_per_year')
        
        if not any([hour, day, week, month, year]):
            raise serializers.ValidationError(
                "You must provide at least one pricing tier (hourly, daily, weekly, monthly, or yearly)."
            )
        return data


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    
    reviewer = serializers.StringRelatedField(read_only=True)
    shop_name = serializers.CharField(source='shop.name', read_only=True, allow_null=True)
    vaadaka_name = serializers.CharField(source='vaadaka.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'reviewer', 'shop', 'shop_name',
            'vaadaka', 'vaadaka_name', 'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'created_at']
    
    def create(self, validated_data):
        """Create review and update ratings"""
        validated_data['reviewer'] = self.context['request'].user
        review = super().create(validated_data)
        return review
