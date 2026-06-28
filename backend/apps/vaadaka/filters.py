import django_filters
from .models import Vaadaka

class VaadakaFilter(django_filters.FilterSet):
    category__in = django_filters.BaseInFilter(field_name='category', lookup_expr='in')

    class Meta:
        model = Vaadaka
        fields = ['category', 'condition', 'shop', 'is_available']
