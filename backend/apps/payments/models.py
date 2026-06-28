import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django.core.validators import MinValueValidator
from django.conf import settings
from apps.shops.models import Shop


class ShopSubscription(models.Model):
    """Shop subscription model for Razorpay subscriptions"""
    
    PLAN_CHOICES = [
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]
    
    # Primary key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relationship
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name='subscriptions'
    )
    
    # Subscription details
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    
    # Razorpay reference
    razorpay_subscription_id = models.CharField(max_length=100, unique=True)
    
    # Status
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='active'
    )
    
    # Subscription period
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'shop_subscriptions'
        indexes = [
            models.Index(fields=['shop']),
            models.Index(fields=['status']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.shop.name} - {self.get_plan_display()} ({self.status})"
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        from django.utils import timezone
        return (
            self.status == 'active' and
            self.expires_at > timezone.now()
        )

class ProviderInvoice(models.Model):
    """Monthly invoice tracking provider's accumulated dues based on booking commissions"""
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='invoices')
    
    # Billing period
    month = models.IntegerField(validators=[MinValueValidator(1)]) # 1-12
    year = models.IntegerField(validators=[MinValueValidator(2020)])
    
    total_due = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    due_date = models.DateTimeField()
    
    # Payment Tracking
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True, unique=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'provider_invoices'
        unique_together = ('provider', 'month', 'year')
        indexes = [
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"Invoice {self.month}/{self.year} - {self.provider.username} ({self.status})"
