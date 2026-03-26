"""
Authentication views for the Tourism API.

Endpoints
─────────
POST /api/auth/login/        – obtain access + refresh token pair
POST /api/auth/refresh/      – exchange refresh token for new access token
POST /api/auth/logout/       – blacklist the refresh token (invalidate session)
GET  /api/auth/me/           – return the current user profile
PUT  /api/auth/me/           – update own email / first/last name
POST /api/auth/register/     – admin-only: create a new API user
GET  /api/auth/users/        – admin-only: list all users
"""

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from rest_framework                          import serializers, status
from rest_framework.permissions              import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.request                 import Request
from rest_framework.response                import Response
from rest_framework.views                   import APIView

from rest_framework_simplejwt.tokens        import RefreshToken
from rest_framework_simplejwt.views         import TokenObtainPairView
from rest_framework_simplejwt.serializers   import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions    import TokenError


# ---------------------------------------------------------------------------
# Serializers
# ---------------------------------------------------------------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Augment the standard JWT payload with extra claims so the frontend
    can display the user's name without an extra /me request.
    """

    @classmethod
    def get_token(cls, user: User):
        token = super().get_token(user)
        # Add custom claims
        token['username']   = user.username
        token['email']      = user.email
        token['is_staff']   = user.is_staff
        token['first_name'] = user.first_name
        token['last_name']  = user.last_name
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Also return user info alongside the tokens
        data['user'] = {
            'id':         self.user.pk,
            'username':   self.user.username,
            'email':      self.user.email,
            'first_name': self.user.first_name,
            'last_name':  self.user.last_name,
            'is_staff':   self.user.is_staff,
        }
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff',
                  'date_joined', 'last_login')
        read_only_fields = ('id', 'username', 'is_staff', 'date_joined', 'last_login')


class UserCreateSerializer(serializers.ModelSerializer):
    """Admin-only: create a new API user with a validated password."""
    password  = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm password',
                                      style={'input_type': 'password'})

    class Meta:
        model  = User
        fields = ('username', 'email', 'first_name', 'last_name', 'password', 'password2',
                  'is_staff')

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ---------------------------------------------------------------------------
# Views
# ---------------------------------------------------------------------------

class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/

    Body: { "username": "...", "password": "..." }
    Returns:
      {
        "access":  "<JWT access token>",
        "refresh": "<JWT refresh token>",
        "user":    { id, username, email, first_name, last_name, is_staff }
      }
    """
    permission_classes = [AllowAny]
    serializer_class   = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """
    POST /api/auth/logout/

    Body: { "refresh": "<refresh token>" }
    Blacklists the refresh token so it can no longer be used to obtain
    new access tokens.  The access token will expire naturally.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request: Request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    """
    GET  /api/auth/me/   – current user profile
    PUT  /api/auth/me/   – update email / first_name / last_name
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request: Request):
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    """
    POST /api/auth/register/

    Admin-only endpoint to create new API users.
    Regular users cannot self-register — this is an internal admin tool.
    """
    permission_classes = [IsAdminUser]

    def post(self, request: Request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'detail': f'User "{user.username}" created successfully.',
                    'user':   UserProfileSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    """
    GET /api/auth/users/

    Admin-only: returns a list of all registered users.
    """
    permission_classes = [IsAdminUser]

    def get(self, request: Request):
        users = User.objects.all().order_by('date_joined')
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data)
