from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "is_staff", "is_active")


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "password", "is_staff", "is_active")
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminLoginSerializer(TokenObtainPairSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["is_staff"] = user.is_staff
        return token

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        request = self.context.get("request")
        user = authenticate(request=request, username=username, password=password)

        if not user:
            raise serializers.ValidationError({"detail": "Invalid credentials."})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "Inactive account."})
        data = super().validate(attrs)
        data["user"] = UserSerializer(user).data
        return data
