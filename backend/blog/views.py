from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Profile, Like, Match, Message
from .serializers import (
    ProfileSerializer, ProfileListSerializer, LikeSerializer,
    MatchSerializer, MessageSerializer, MessageCreateSerializer
)


class ProfileViewSet(viewsets.ModelViewSet):
    """プロフィールViewSet"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['display_name', 'bio', 'interests', 'location']
    ordering_fields = ['created_at', 'age']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProfileListSerializer
        return ProfileSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """自分のプロフィールを取得"""
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_me(self, request):
        """自分のプロフィールを更新"""
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def discover(self, request):
        """おすすめユーザーを取得（自分以外のユーザー）"""
        # 自分と既にいいねしたユーザーを除外
        liked_users = Like.objects.filter(from_user=request.user).values_list('to_user', flat=True)
        profiles = Profile.objects.exclude(
            Q(user=request.user) | Q(user__in=liked_users)
        ).select_related('user')
        
        # フィルタリング
        page = self.paginate_queryset(profiles)
        if page is not None:
            serializer = ProfileListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProfileListSerializer(profiles, many=True)
        return Response(serializer.data)


class LikeViewSet(viewsets.ModelViewSet):
    """いいねViewSet"""
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """自分が送った、または受け取ったいいねのみを表示"""
        return Like.objects.filter(
            Q(from_user=self.request.user) | Q(to_user=self.request.user)
        ).select_related('from_user', 'to_user', 'from_user__profile', 'to_user__profile')
    
    def create(self, request, *args, **kwargs):
        """いいねを送る"""
        to_user_id = request.data.get('to_user')
        
        if not to_user_id:
            return Response(
                {'error': 'to_user is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 自分自身にはいいねできない
        if to_user == request.user:
            return Response(
                {'error': 'Cannot like yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 既にいいね済みかチェック
        like, created = Like.objects.get_or_create(
            from_user=request.user,
            to_user=to_user
        )
        
        if not created:
            return Response(
                {'message': 'Already liked'},
                status=status.HTTP_200_OK
            )
        
        # 相互いいねの場合、マッチングを作成
        is_mutual = Like.objects.filter(
            from_user=to_user,
            to_user=request.user
        ).exists()
        
        if is_mutual:
            match, match_created = Match.create_match(request.user, to_user)
            serializer = self.get_serializer(like)
            return Response({
                'like': serializer.data,
                'matched': True,
                'match_id': match.id
            }, status=status.HTTP_201_CREATED)
        
        serializer = self.get_serializer(like)
        return Response({
            'like': serializer.data,
            'matched': False
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def sent(self, request):
        """送信したいいね一覧"""
        likes = self.get_queryset().filter(from_user=request.user)
        page = self.paginate_queryset(likes)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(likes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def received(self, request):
        """受信したいいね一覧"""
        likes = self.get_queryset().filter(to_user=request.user)
        page = self.paginate_queryset(likes)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(likes, many=True)
        return Response(serializer.data)


class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    """マッチングViewSet"""
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """自分のマッチングのみを表示"""
        return Match.objects.filter(
            Q(user1=self.request.user) | Q(user2=self.request.user)
        ).select_related('user1', 'user2', 'user1__profile', 'user2__profile')


class MessageViewSet(viewsets.ModelViewSet):
    """メッセージViewSet"""
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """自分が関係するマッチングのメッセージのみを表示"""
        user_matches = Match.objects.filter(
            Q(user1=self.request.user) | Q(user2=self.request.user)
        )
        return Message.objects.filter(match__in=user_matches).select_related(
            'match', 'sender', 'sender__profile'
        )
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    def create(self, request, *args, **kwargs):
        """メッセージを送信"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # マッチングの検証
        match = serializer.validated_data['match']
        if match.user1 != request.user and match.user2 != request.user:
            return Response(
                {'error': 'You are not part of this match'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save(sender=request.user)
        
        # 完全なメッセージデータを返す
        message = Message.objects.get(id=serializer.data['id'])
        response_serializer = MessageSerializer(message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def by_match(self, request):
        """特定のマッチングのメッセージ履歴を取得"""
        match_id = request.query_params.get('match_id')
        if not match_id:
            return Response(
                {'error': 'match_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        messages = self.get_queryset().filter(match_id=match_id)
        page = self.paginate_queryset(messages)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """メッセージを既読にする"""
        message = self.get_object()
        if message.sender == request.user:
            return Response(
                {'error': 'Cannot mark your own message as read'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message.is_read = True
        message.save()
        serializer = self.get_serializer(message)
        return Response(serializer.data)


