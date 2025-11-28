from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Profile, Like, Match, Message, Block
from .serializers import (
    ProfileSerializer, ProfileListSerializer, LikeSerializer,
    MatchSerializer, MessageSerializer, MessageCreateSerializer, BlockSerializer
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
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """いいねを承認してマッチングを作成"""
        like = self.get_object()
        
        # 自分宛のいいねかチェック
        if like.to_user != request.user:
            return Response(
                {'error': 'You can only accept likes sent to you'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 既にマッチング済みかチェック
        existing_match = Match.objects.filter(
            Q(user1=request.user, user2=like.from_user) |
            Q(user1=like.from_user, user2=request.user)
        ).exists()
        
        if existing_match:
            return Response(
                {'message': 'Already matched'},
                status=status.HTTP_200_OK
            )
        
        # いいねを返す（相互いいね状態にする）
        return_like, created = Like.objects.get_or_create(
            from_user=request.user,
            to_user=like.from_user
        )
        
        # マッチングを作成
        match, match_created = Match.create_match(request.user, like.from_user)
        
        return Response({
            'message': 'Match created successfully',
            'matched': True,
            'match_id': match.id
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """いいねを拒否（削除）"""
        like = self.get_object()
        
        # 自分宛のいいねかチェック
        if like.to_user != request.user:
            return Response(
                {'error': 'You can only reject likes sent to you'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        like.delete()
        return Response(
            {'message': 'Like rejected successfully'},
            status=status.HTTP_200_OK
        )


class MatchViewSet(viewsets.ModelViewSet):
    """マッチングViewSet"""
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'delete']  # 取得と削除のみ許可
    
    def get_queryset(self):
        """自分のマッチングのみを表示"""
        return Match.objects.filter(
            Q(user1=self.request.user) | Q(user2=self.request.user)
        ).select_related('user1', 'user2', 'user1__profile', 'user2__profile')
    
    def destroy(self, request, *args, **kwargs):
        """マッチングを解除（削除）"""
        match = self.get_object()
        
        # 自分が関係するマッチングかチェック
        if match.user1 != request.user and match.user2 != request.user:
            return Response(
                {'error': 'You are not part of this match'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # 相互いいねを削除
        Like.objects.filter(
            Q(from_user=match.user1, to_user=match.user2) |
            Q(from_user=match.user2, to_user=match.user1)
        ).delete()
        
        # マッチングを削除（関連メッセージはカスケードで削除される）
        match.delete()
        
        return Response(
            {'message': 'Match deleted successfully'},
            status=status.HTTP_200_OK
        )


class BlockViewSet(viewsets.ModelViewSet):
    """ブロックViewSet"""
    queryset = Block.objects.all()
    serializer_class = BlockSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']
    
    def get_queryset(self):
        """自分がブロックしたユーザーのみを表示"""
        return Block.objects.filter(blocker=self.request.user).select_related('blocked', 'blocked__profile')
    
    def create(self, request, *args, **kwargs):
        """ユーザーをブロック"""
        blocked_user_id = request.data.get('blocked_user')
        reason = request.data.get('reason', '')
        
        if not blocked_user_id:
            return Response(
                {'error': 'blocked_user is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            blocked_user = User.objects.get(id=blocked_user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 自分自身はブロックできない
        if blocked_user == request.user:
            return Response(
                {'error': 'Cannot block yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ブロック作成
        block, created = Block.objects.get_or_create(
            blocker=request.user,
            blocked=blocked_user,
            defaults={'reason': reason}
        )
        
        if not created:
            return Response(
                {'message': 'Already blocked'},
                status=status.HTTP_200_OK
            )
        
        # マッチングがあれば削除
        Match.objects.filter(
            Q(user1=request.user, user2=blocked_user) |
            Q(user1=blocked_user, user2=request.user)
        ).delete()
        
        # いいねを削除
        Like.objects.filter(
            Q(from_user=request.user, to_user=blocked_user) |
            Q(from_user=blocked_user, to_user=request.user)
        ).delete()
        
        return Response(
            {'message': 'User blocked successfully'},
            status=status.HTTP_201_CREATED
        )
    
    def destroy(self, request, *args, **kwargs):
        """ブロックを解除"""
        block = self.get_object()
        
        # 自分がブロックしたものかチェック
        if block.blocker != request.user:
            return Response(
                {'error': 'You can only unblock users you have blocked'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        block.delete()
        return Response(
            {'message': 'User unblocked successfully'},
            status=status.HTTP_200_OK
        )


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
        
        # メッセージを保存
        message = serializer.save(sender=request.user)
        
        # 完全なメッセージデータを返す
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


