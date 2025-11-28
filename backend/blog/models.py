from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    """ユーザープロフィールモデル"""
    GENDER_CHOICES = [
        ('male', '男性'),
        ('female', '女性'),
        ('other', 'その他'),
    ]
    
    user = models.OneToOneField(User, verbose_name='ユーザー', on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField('表示名', max_length=50)
    bio = models.TextField('自己紹介', max_length=500, blank=True)
    age = models.PositiveIntegerField('年齢', null=True, blank=True)
    gender = models.CharField('性別', max_length=10, choices=GENDER_CHOICES, blank=True)
    location = models.CharField('居住地', max_length=100, blank=True)
    
    avatar = models.ImageField('プロフィール画像', upload_to='avatars/', blank=True, null=True)
    interests = models.TextField('興味・趣味', blank=True, help_text='カンマ区切りで入力')
    
    created_at = models.DateTimeField('作成日時', auto_now_add=True)
    updated_at = models.DateTimeField('更新日時', auto_now=True)
    
    class Meta:
        verbose_name = 'プロフィール'
        verbose_name_plural = 'プロフィール'
    
    def __str__(self):
        return f'{self.display_name} ({self.user.username})'
    
    @property
    def interests_list(self):
        """興味をリスト形式で返す"""
        if self.interests:
            return [interest.strip() for interest in self.interests.split(',')]
        return []


class Like(models.Model):
    """いいねモデル"""
    from_user = models.ForeignKey(User, verbose_name='送信者', on_delete=models.CASCADE, related_name='likes_sent')
    to_user = models.ForeignKey(User, verbose_name='受信者', on_delete=models.CASCADE, related_name='likes_received')
    created_at = models.DateTimeField('作成日時', auto_now_add=True)
    
    class Meta:
        verbose_name = 'いいね'
        verbose_name_plural = 'いいね'
        unique_together = ['from_user', 'to_user']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['from_user', 'to_user']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f'{self.from_user.username} → {self.to_user.username}'
    
    def is_mutual(self):
        """相互いいねかどうかを判定"""
        return Like.objects.filter(
            from_user=self.to_user,
            to_user=self.from_user
        ).exists()


class Match(models.Model):
    """マッチングモデル（相互いいね）"""
    user1 = models.ForeignKey(User, verbose_name='ユーザー1', on_delete=models.CASCADE, related_name='matches_as_user1')
    user2 = models.ForeignKey(User, verbose_name='ユーザー2', on_delete=models.CASCADE, related_name='matches_as_user2')
    created_at = models.DateTimeField('マッチング日時', auto_now_add=True)
    
    class Meta:
        verbose_name = 'マッチング'
        verbose_name_plural = 'マッチング'
        unique_together = ['user1', 'user2']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user1', 'user2']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f'{self.user1.username} ⇄ {self.user2.username}'
    
    @classmethod
    def create_match(cls, user1, user2):
        """マッチングを作成（user1 < user2の順序で保存）"""
        if user1.id > user2.id:
            user1, user2 = user2, user1
        match, created = cls.objects.get_or_create(user1=user1, user2=user2)
        return match, created


class Block(models.Model):
    """ブロックモデル"""
    blocker = models.ForeignKey(User, verbose_name='ブロックした人', on_delete=models.CASCADE, related_name='blocking')
    blocked = models.ForeignKey(User, verbose_name='ブロックされた人', on_delete=models.CASCADE, related_name='blocked_by')
    created_at = models.DateTimeField('ブロック日時', auto_now_add=True)
    reason = models.CharField('理由', max_length=200, blank=True)
    
    class Meta:
        verbose_name = 'ブロック'
        verbose_name_plural = 'ブロック'
        unique_together = ['blocker', 'blocked']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['blocker', 'blocked']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f'{self.blocker.username} → {self.blocked.username}'


class Message(models.Model):
    """メッセージモデル"""
    match = models.ForeignKey(Match, verbose_name='マッチング', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, verbose_name='送信者', on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField('メッセージ内容')
    is_read = models.BooleanField('既読', default=False)
    created_at = models.DateTimeField('送信日時', auto_now_add=True)
    
    class Meta:
        verbose_name = 'メッセージ'
        verbose_name_plural = 'メッセージ'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['match', 'created_at']),
        ]
    
    def __str__(self):
        return f'{self.sender.username}: {self.content[:30]}'
