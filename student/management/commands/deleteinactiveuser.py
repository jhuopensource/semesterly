from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import logging
from parsing.command_logger import CommandLogger

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
        # Create a dictionary of arguments for logging
        log_args = {
            'dry_run': options['dry_run'],
            'years': options['years'],
            'batch_size': options['batch_size']
        }
        
        # Use the command logger
        with  CommandLogger('deleteinactiveuser', log_args) as cmd_logger:
            try:
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
                    cmd_logger.log_output('No inactive users found.')
                    return
                
                cmd_logger.log_output(f'Found {count} inactive users (last login before {cutoff_date}).')
                
                if dry_run:
                    cmd_logger.log_output('DRY RUN: No users will be deleted.')
                    for user in inactive_users:
                        cmd_logger.log_output(f'Would delete: {user.username} (last login: {user.last_login})')
                else:
                    # Log the users that will be deleted
                    for user in inactive_users:
                        logger.info(f'Deleting inactive user: {user.username} (last login: {user.last_login})')
                        cmd_logger.log_output(f'Deleting user: {user.username} (last login: {user.last_login})')
                    
                    # Delete the users
                    inactive_users.delete()
                    cmd_logger.log_output(f'Successfully deleted {count} inactive users.')
            
            except Exception as e:
                cmd_logger.log_error(f"Error in deleteinactiveuser command: {str(e)}")
                raise
