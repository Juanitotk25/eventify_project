from rest_framework import serializers
from .models import Event, Category, EventRegistration

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')

class EventSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    organizer_username = serializers.CharField(source='organizer.user.username', read_only=True) 
    cover_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    average_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'organizer_username', 'title', 'description', 
            'category', 'category_name', 'location', 'start_time', 'end_time', 
            'capacity', 'is_public', 'cover_url', 'created_at', 'updated_at',
            'average_rating'
        ]
        read_only_fields = ['id', 'organizer', 'organizer_username', 'created_at', 'updated_at']

class EventRegistrationSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    user_full_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    
    def get_user_username(self, obj):
        """Get username from the related User model through Profile."""
        try:
            if obj.user and hasattr(obj.user, 'user') and obj.user.user:
                return obj.user.user.username or "Usuario"
        except AttributeError:
            pass
        return "Usuario"
    
    def get_user_full_name(self, obj):
        """Get full name from Profile."""
        try:
            if obj.user and hasattr(obj.user, 'full_name'):
                return obj.user.full_name or "Usuario"
        except AttributeError:
            pass
        return "Usuario"
    
    def get_user_email(self, obj):
        """Get email from the related User model."""
        try:
            if obj.user and hasattr(obj.user, 'user') and obj.user.user:
                return obj.user.user.email or ""
        except AttributeError:
            pass
        return ""
   
    class Meta:
        model = EventRegistration
        fields = [
            "id", "event", "user", "rating", "comment", "status", 
            "user_username", "user_full_name", "user_email",
            "created_at", "updated_at"
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']