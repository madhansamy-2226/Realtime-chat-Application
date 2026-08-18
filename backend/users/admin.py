from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_online', 'last_seen', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Chat Extra Info', {'fields': ('avatar', 'avatar_url', 'bio', 'is_online', 'last_seen')}),
    )
