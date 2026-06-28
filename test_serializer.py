import sys
try:
    from apps.vaadaka.models import Vaadaka
    from apps.vaadaka.serializers import VaadakaSerializer
    print(VaadakaSerializer(Vaadaka.objects.first()).data)
except Exception as e:
    print(f"ERROR: {e}")
