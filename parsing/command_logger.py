import json
import sys
from io import StringIO
from django.utils import timezone
from .models import CommandExecutionLog


class CommandLogger:
    """
    A utility class to log management command executions.

    Usage:
        with CommandLogger('command_name', {'arg1': 'value1'}) as logger:
            # Command code here
            logger.log_output("Some output message")
            # If there's an error
            logger.log_error("Error message")
    """

    def __init__(self, command_name, arguments=None):
        self.command_name = command_name
        self.arguments = arguments or {}
        self.log_entry = None
        self._output_buffer = StringIO()
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr

    def __enter__(self):
        # Create a new log entry
        self.log_entry = CommandExecutionLog.objects.create(
            command_name=self.command_name,
            arguments=json.dumps(self.arguments, indent=2),
        )
        # Redirect stdout and stderr to capture output
        sys.stdout = self._output_buffer
        sys.stderr = self._output_buffer

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        # Restore stdout and stderr
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr

        # Update the log entry
        if self.log_entry:
            self.log_entry.end_time = timezone.now()

            # Capture the output
            self.log_entry.output = self._output_buffer.getvalue()

            # Handle exceptions
            if exc_type is not None:
                self.log_entry.status = "error"
                self.log_entry.error_message = f"{exc_type.__name__}: {str(exc_value)}"
                if traceback:
                    import traceback as tb

                    self.log_entry.error_message += f"\n{tb.format_tb(traceback)}"

            self.log_entry.save()

    def log_output(self, message):
        """Log a message to the output buffer"""
        print(message)

    def log_error(self, message):
        """Log an error message"""
        self.log_entry.status = "error"
        self.log_entry.error_message = message
        print(f"ERROR: {message}", file=sys.stderr)

    def log_warning(self, message):
        """Log a warning message"""
        if self.log_entry.status != "error":
            self.log_entry.status = "warning"
        print(f"WARNING: {message}", file=sys.stderr)
