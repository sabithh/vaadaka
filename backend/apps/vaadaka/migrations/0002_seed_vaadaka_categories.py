from django.db import migrations

def seed_categories(apps, schema_editor):
    VaadakaCategory = apps.get_model('vaadaka', 'VaadakaCategory')
    categories = [
        {'name': 'Power Tools', 'slug': 'power-tools', 'icon': 'Zap'},
        {'name': 'Hand Tools', 'slug': 'hand-tools', 'icon': 'Hammer'},
        {'name': 'Lawn & Garden', 'slug': 'lawn-garden', 'icon': 'Leaf'},
        {'name': 'Heavy Machinery', 'slug': 'heavy-machinery', 'icon': 'Truck'},
        {'name': 'Plumbing', 'slug': 'plumbing', 'icon': 'Wrench'},
        {'name': 'Electrical', 'slug': 'electrical', 'icon': 'Lightning'},
        {'name': 'Painting', 'slug': 'painting', 'icon': 'Brush'}
    ]
    for cat in categories:
        VaadakaCategory.objects.get_or_create(slug=cat['slug'], defaults=cat)

def reverse_seed(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('vaadaka', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_seed),
    ]
