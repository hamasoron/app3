from django.contrib import admin
from .models import Profile, Like, Match, Message, Block


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'user', 'age', 'gender', 'location', 'created_at']
    list_filter = ['gender', 'created_at']
    search_fields = ['display_name', 'user__username', 'bio']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['from_user', 'to_user', 'created_at', 'is_mutual']
    list_filter = ['created_at']
    search_fields = ['from_user__username', 'to_user__username']
    readonly_fields = ['created_at']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['user1', 'user2', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user1__username', 'user2__username']
    readonly_fields = ['created_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'match', 'content_preview', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__username', 'content']
    readonly_fields = ['created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'メッセージ'


@admin.register(Block)
class BlockAdmin(admin.ModelAdmin):
    list_display = ['blocker', 'blocked', 'reason', 'created_at']
    list_filter = ['created_at']
    search_fields = ['blocker__username', 'blocked__username', 'reason']
    readonly_fields = ['created_at']


