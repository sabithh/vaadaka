 # Vaadaka Backend - Quick Start Guide

## 🚀 Getting Started

### Admin Access
- **URL:** http://127.0.0.1:8000/admin/
- **Username:** admin
- **Password:** admin123

### API Root
- **URL:** http://127.0.0.1:8000/api/

---

## 📋 Available Models in Admin

1. **Users** - Manage renters and providers
2. **Shops** - Tool rental shop profiles
3. **Tool Categories** - Organize tools by category
4. **Tools** - Tool listings with pricing
5. **Bookings** - Rental bookings
6. **Reviews** - Tool and shop reviews
7. **Shop Subscriptions** - Razorpay subscriptions
8. **Notifications** - User notifications

---

## 🔧 Development Commands

### Start Server
```bash
cd backend
.\venv\Scripts\activate
.\venv\Scripts\python manage.py runserver
```

### Create Migrations (after model changes)
```bash
.\venv\Scripts\python manage.py makemigrations
.\venv\Scripts\python manage.py migrate
```

### Create Superuser
```bash
.\venv\Scripts\python manage.py createsuperuser
```

### Check for Issues
```bash
.\venv\Scripts\python manage.py check
```

---

## 📁 Project Structure

```
backend/
├── apps/
│   ├── users/          # Custom user model
│   ├── shops/          # Shop management
│   ├── tools/          # Tool listings & categories
│   ├── bookings/       # Booking system
│   └── payments/       # Razorpay integration
├── config/             # Django settings
├── db.sqlite3          # SQLite database
├── manage.py           # Django CLI
└── requirements.txt    # Dependencies
```

---

## 🌍 Database

- **Current:** SQLite (local development)
- **Production:** PostgreSQL with PostGIS (Railway)
- **Location:** `backend/db.sqlite3`

---

## 🔑 Environment Variables

See `.env` file for configuration:
- Database settings
- CORS origins
- Razorpay keys (add when ready)
- JWT token lifetimes

---

## 📝 Next Steps

1. ✅ Database setup complete
2. ✅ Admin panel accessible
3. 🔜 Build REST API endpoints
4. 🔜 Add authentication (JWT)
5. 🔜 Create frontend integration
