from django.contrib import admin
from .models import DataUpdateSettings, CommandExecutionLog


@admin.register(DataUpdateSettings)
class DataUpdateSettingsAdmin(admin.ModelAdmin):
    list_display = ("year", "term", "active", "min_allowed_year", "max_allowed_year")
    list_filter = ("year", "term", "active")
    search_fields = ("year", "term")

    def has_add_permission(self, request):
        # Prevent adding if an instance already exists
        if DataUpdateSettings.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of the single instance
        return False


@admin.register(CommandExecutionLog)
class CommandExecutionLogAdmin(admin.ModelAdmin):
    list_display = ("command_name", "start_time", "end_time", "status")
    list_filter = ("status",)
    search_fields = ("command_name",)
    readonly_fields = (
        "command_name",
        "arguments",
        "start_time",
        "end_time",
        "status",
        "error_message",
        "output",
    )
