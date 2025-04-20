from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Deletes users whose last login time is 2 years ago (inclusive)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run the command without actually deleting users',
        )
        parser.add_argument(
            '--years',
            type=int,
            default=2,
            help='Number of years of inactivity before deletion (default: 2)',
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=100,
            help='Number of users to process (default: 100)',
        )

    def handle(self, *args, **options):
        User = get_user_model()
        dry_run = options['dry_run']
        years = options['years']
        batch_size = options['batch_size']
        
        # Calculate the cutoff date (2 years ago from now)
        cutoff_date = timezone.now() - timedelta(days=years*365)
        
        # Get users primary keys since slicing cannot be used with delete
        inactive_users_pks = User.objects.filter(last_login__lte=cutoff_date).values_list('pk')[:batch_size]
        # Get users by primary keys without slicing
        inactive_users = User.objects.filter(pk__in=inactive_users_pks)
        
        count = inactive_users.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No inactive users found.'))
            return
        
        self.stdout.write(f'Found {count} inactive users (last login before {cutoff_date}).')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN: No users will be deleted.'))
            for user in inactive_users:
                self.stdout.write(f'Would delete: {user.username} (last login: {user.last_login})')
        else:
            # Log the users that will be deleted
            for user in inactive_users:
                logger.info(f'Deleting inactive user: {user.username} (last login: {user.last_login})')
            
            # Delete the users
            inactive_users.delete()
            self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} inactive users.'))
