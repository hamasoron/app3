from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Like, Match, Message


class UserSerializer(serializers.ModelSerializer):
    """ユーザーシリアライザ"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class ProfileSerializer(serializers.ModelSerializer):
    """プロフィールシリアライザ"""
    user = UserSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    interests_list = serializers.ListField(read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'username', 'display_name', 'bio', 'age', 'gender',
            'location', 'avatar', 'interests', 'interests_list',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class ProfileListSerializer(serializers.ModelSerializer):
    """プロフィール一覧用シリアライザ（軽量版）"""
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user_id', 'username', 'display_name', 'age', 'gender',
            'location', 'avatar', 'bio'
        ]


class LikeSerializer(serializers.ModelSerializer):
    """いいねシリアライザ"""
    from_user_profile = ProfileListSerializer(source='from_user.profile', read_only=True)
    to_user_profile = ProfileListSerializer(source='to_user.profile', read_only=True)
    is_mutual = serializers.SerializerMethodField()
    
    class Meta:
        model = Like
        fields = ['id', 'from_user', 'to_user', 'from_user_profile', 'to_user_profile', 'is_mutual', 'created_at']
        read_only_fields = ['id', 'from_user', 'created_at']
    
    def get_is_mutual(self, obj):
        return obj.is_mutual()


class MatchSerializer(serializers.ModelSerializer):
    """マッチングシリアライザ"""
    user1_profile = ProfileListSerializer(source='user1.profile', read_only=True)
    user2_profile = ProfileListSerializer(source='user2.profile', read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'user1', 'user2', 'user1_profile', 'user2_profile', 'created_at']
        read_only_fields = ['id', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    """メッセージシリアライザ"""
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_display_name = serializers.CharField(source='sender.profile.display_name', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'match', 'sender', 'sender_username', 'sender_display_name',
            'content', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'sender', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    """メッセージ作成用シリアライザ"""
    class Meta:
        model = Message
        fields = ['match', 'content']


