import sys
try:
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    user = User.objects.filter(username='admin').first()
    if user:
        print(f"User exists! ID: {user.id}, Superuser: {user.is_superuser}")
        user.set_password('Admin1234!')
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print("Password reset to Admin1234! and permissions forced.")
    else:
        print("User does NOT exist, creating now...")
        user = User.objects.create_superuser('admin', 'admin@example.com', 'Admin1234!')
        print(f"Created new superuser: {user.username}")
except Exception as e:
    print(f"ERROR: {e}")
