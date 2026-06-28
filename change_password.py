import sys
try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    user = User.objects.filter(username='admin').first()
    if user:
        user.set_password('Vaadakamothalalli@s&s23')
        user.save()
        print("Password reset successfully.")
    else:
        print("User does NOT exist.")
except Exception as e:
    print(f"ERROR: {e}")
