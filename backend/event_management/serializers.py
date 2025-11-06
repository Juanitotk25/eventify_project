from rest_framework import serializers
from .models import Event, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')

class EventSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    organizer_username = serializers.CharField(source='organizer.user.username', read_only=True) # Asumo que Profile tiene un campo user relacionado

    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'organizer_username', 'title', 'description', 
            'category', 'category_name', 'location', 'start_time', 'end_time', 
            'capacity', 'is_public', 'cover_url', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'organizer', 'organizer_username', 'created_at', 'updated_at']