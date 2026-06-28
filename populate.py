from apps.vaadaka.models import VaadakaCategory
from django.utils.text import slugify
import re

categories = [
    '🔧 Tools & Equipment', '🏗️ Construction', '🌿 Gardening', '🚗 Vehicles',
    '🚴 Cycles & Mobility', '📷 Cameras & Photography', '🎥 Audio & Video',
    '💻 Electronics', '📱 Mobile Devices', '🎮 Gaming', '🎵 Musical Instruments',
    '👗 Fashion & Clothing', '💍 Jewelry & Accessories', '🎭 Party & Event Supplies',
    '🎪 Event Equipment', '🏕️ Camping & Outdoor', '🏋️ Sports & Fitness',
    '🏄 Adventure Gear', '🏠 Home Appliances', '🍳 Kitchen Equipment',
    '🛋️ Furniture', '🏢 Office Equipment', '👶 Baby & Kids', '🐶 Pet Supplies',
    '🎨 Art & Creative', '📚 Books & Study', '🧪 Lab & Medical', '🚜 Agriculture',
    '🚢 Water Sports', '✈️ Travel Essentials', '🎁 Miscellaneous'
]

for name in categories:
    # Strip emojis for a clean slug
    clean_name = re.sub(r'[^\w\s-]', '', name).strip()
    slug = slugify(clean_name)
    if not slug:
        slug = slugify("category") # fallback
    VaadakaCategory.objects.get_or_create(name=name, defaults={'slug': slug})

print('Categories added successfully!')
