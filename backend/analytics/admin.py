from django.contrib import admin

from analytics.models import Trip, RouteStop, DailyLog, LogEntry

admin.site.register(Trip)
admin.site.register(RouteStop)
admin.site.register(DailyLog)
admin.site.register(LogEntry)