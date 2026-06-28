import os
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum
from apps.bookings.models import Booking
from apps.payments.models import ProviderInvoice
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Generates monthly invoices for providers based on platform fees accumulated in the previous month.'

    def handle(self, *args, **options):
        # 1. Determine the "previous month"
        # If this script runs on the 1st of the month, we want to bill for the PREVIOUS month.
        today = timezone.now()
        # Get the first day of the current month
        first_of_this_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        # Subtract one day to get into the previous month
        last_day_of_prev_month = first_of_this_month - timedelta(days=1)
        
        target_month = last_day_of_prev_month.month
        target_year = last_day_of_prev_month.year

        self.stdout.write(f"Generating invoices for {target_month}/{target_year}")

        # 2. Get all providers
        providers = User.objects.filter(user_type='provider')
        invoices_created = 0

        for provider in providers:
            # Check if invoice already exists for this month/year
            if ProviderInvoice.objects.filter(provider=provider, month=target_month, year=target_year).exists():
                self.stdout.write(f"Invoice already exists for provider {provider.username} for {target_month}/{target_year}")
                continue

            # Get all shops owned by this provider
            shop_ids = provider.shops.values_list('id', flat=True)
            if not shop_ids:
                continue
            
            # 3. Calculate total platform_fee from bookings in that month
            bookings = Booking.objects.filter(
                shop_id__in=shop_ids,
                payment_status='paid',
                created_at__year=target_year,
                created_at__month=target_month
            )
            
            total_fees = bookings.aggregate(total=Sum('platform_fee'))['total'] or 0

            # Only generate an invoice if they actually owe something
            if total_fees > 0:
                # Due date is the 5th of the CURRENT month
                due_date = first_of_this_month.replace(day=5, hour=23, minute=59, second=59)

                ProviderInvoice.objects.create(
                    provider=provider,
                    month=target_month,
                    year=target_year,
                    total_due=total_fees,
                    due_date=due_date,
                    status='pending'
                )
                invoices_created += 1
                self.stdout.write(f"Created invoice for {provider.username}: {total_fees}")

        self.stdout.write(self.style.SUCCESS(f"Successfully generated {invoices_created} invoices."))
