from rest_framework import serializers
from .models import Event, Category, EventRegistration
from django.utils import timezone

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name')

class EventSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    organizer_username = serializers.CharField(source='organizer.user.username', read_only=True) 
    cover_url = serializers.URLField(required=False, allow_null=True, allow_blank=True)
    average_rating = serializers.FloatField(read_only=True)
    
    # Nuevo campo para saber si el usuario actual está registrado
    is_registered = serializers.SerializerMethodField()
    registration_status = serializers.SerializerMethodField()
    registration_id = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'organizer', 'organizer_username', 'title', 'description', 
            'category', 'category_name', 'location', 'start_time', 'end_time', 
            'capacity', 'is_public', 'cover_url', 'created_at', 'updated_at',
            'average_rating', 'is_registered', 'registration_status', 'registration_id'
        ]
        read_only_fields = ['id', 'organizer', 'organizer_username', 'created_at', 'updated_at']

    def get_is_registered(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                return EventRegistration.objects.filter(
                    user=request.user.profile,
                    event=obj
                ).exists()
            except:
                return False
        return False

    def get_registration_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                registration = EventRegistration.objects.filter(
                    user=request.user.profile,
                    event=obj
                ).first()
                return registration.status if registration else None
            except:
                return None
        return None

    def get_registration_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                registration = EventRegistration.objects.filter(
                    user=request.user.profile,
                    event=obj
                ).first()
                return str(registration.id) if registration else None
            except:
                return None
        return None

class EventRegistrationSerializer(serializers.ModelSerializer):
    user_username = serializers.SerializerMethodField()
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_start_time = serializers.DateTimeField(source='event.start_time', read_only=True)
    event_end_time = serializers.DateTimeField(source='event.end_time', read_only=True)
    event_location = serializers.CharField(source='event.location', read_only=True)
    event_category_name = serializers.CharField(source='event.category.name', read_only=True)
    
    def get_user_username(self, obj):
        """
        Get username from the related User model through Profile.
        Profile.user -> User (Django's User model)
        """
        try:
            if obj.user and hasattr(obj.user, 'user') and obj.user.user:
                return obj.user.user.username or "Usuario"
        except AttributeError:
            pass
        return "Usuario"
   
    class Meta:
        model = EventRegistration
        fields = [
            'id', 'user', 'user_username', 'event', 'event_title', 
            'event_start_time', 'event_end_time', 'event_location',
            'event_category_name', 'status', 'attended', 'notification_read',
            'rating', 'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

# ========== SERIALIZADORES PARA REPORTES ==========

class UserReportSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    status = serializers.CharField()
    attended = serializers.BooleanField()
    attendance_status = serializers.CharField()
    registration_date = serializers.DateTimeField()
    rating = serializers.IntegerField(allow_null=True)
    comment = serializers.CharField(allow_null=True)

class EventReportSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField(allow_null=True)
    date = serializers.DateTimeField()
    end_date = serializers.DateTimeField(allow_null=True)
    location = serializers.CharField(allow_null=True)
    capacity = serializers.IntegerField(allow_null=True)
    organizer = serializers.CharField()
    category = serializers.CharField(allow_null=True)

class StatisticsSerializer(serializers.Serializer):
    total_registered = serializers.IntegerField()
    status_distribution = serializers.DictField(child=serializers.IntegerField())
    attended = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    available_spots = serializers.CharField()
    occupancy_rate = serializers.FloatField()
    average_rating = serializers.FloatField()

class OrganizerEventReportSerializer(serializers.Serializer):
    event = EventReportSerializer()
    statistics = StatisticsSerializer()
    registered_users = UserReportSerializer(many=True)

class OrganizerSummaryEventSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    date = serializers.DateTimeField()
    end_date = serializers.DateTimeField(allow_null=True)
    location = serializers.CharField(allow_null=True)
    category = serializers.CharField(allow_null=True)
    capacity = serializers.IntegerField(allow_null=True)
    registered_count = serializers.IntegerField()
    confirmed_count = serializers.IntegerField()
    attended_count = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    occupancy_rate = serializers.FloatField()

class TotalStatisticsSerializer(serializers.Serializer):
    total_events = serializers.IntegerField()
    total_registered = serializers.IntegerField()
    total_confirmed = serializers.IntegerField()
    total_attended = serializers.IntegerField()
    total_capacity = serializers.IntegerField()
    avg_attendance_rate = serializers.FloatField()
    avg_occupancy_rate = serializers.FloatField()

class OrganizerAllEventsReportSerializer(serializers.Serializer):
    organizer = serializers.DictField(child=serializers.CharField())
    total_statistics = TotalStatisticsSerializer()
    events = OrganizerSummaryEventSerializer(many=True)

# ========== SERIALIZADORES PARA NOTIFICACIONES ==========

class EventNotificationSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    date = serializers.DateTimeField()
    end_time = serializers.DateTimeField(allow_null=True)
    location = serializers.CharField()
    registration_id = serializers.CharField()
    registration_status = serializers.CharField()
    notification_read = serializers.BooleanField()
    attended = serializers.BooleanField()
    is_upcoming = serializers.BooleanField()
    is_today = serializers.BooleanField()

class NotificationResponseSerializer(serializers.Serializer):
    events = EventNotificationSerializer(many=True)
    unread_count = serializers.IntegerField()

# ========== SERIALIZADORES PARA ADMIN REPORTES ==========

class TimePeriodSerializer(serializers.Serializer):
    start_date = serializers.CharField(allow_null=True)
    end_date = serializers.CharField(allow_null=True)
    period_days = serializers.CharField(allow_null=True)

class SummarySerializer(serializers.Serializer):
    total_events = serializers.IntegerField()
    total_users = serializers.IntegerField()
    users_with_profile = serializers.IntegerField()
    total_registrations = serializers.IntegerField()
    attended_registrations = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    upcoming_events = serializers.IntegerField()
    ongoing_events = serializers.IntegerField()
    past_events = serializers.IntegerField()

class EventOverTimeSerializer(serializers.Serializer):
    month = serializers.DateTimeField()
    count = serializers.IntegerField()
    avg_registrations = serializers.FloatField()

class PopularEventSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    organizer = serializers.CharField()
    date = serializers.DateTimeField()
    registered_count = serializers.IntegerField()
    attended_count = serializers.IntegerField()
    capacity = serializers.IntegerField(allow_null=True)
    occupancy_rate = serializers.FloatField()
    attendance_rate = serializers.FloatField()

class CategoryDistributionSerializer(serializers.Serializer):
    category = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()
    avg_capacity = serializers.FloatField()
    avg_registrations = serializers.FloatField()

class OrganizerStatSerializer(serializers.Serializer):
    organizer__user__username = serializers.CharField(allow_null=True)
    event_count = serializers.IntegerField()
    total_registrations = serializers.IntegerField()
    avg_attendance = serializers.FloatField(allow_null=True)

class EventStatusDistributionSerializer(serializers.Serializer):
    upcoming = serializers.IntegerField()
    ongoing = serializers.IntegerField()
    past = serializers.IntegerField()

class AdminGlobalReportSerializer(serializers.Serializer):
    time_period = TimePeriodSerializer()
    summary = SummarySerializer()
    events_over_time = serializers.DictField(child=serializers.ListField(child=EventOverTimeSerializer()))
    popular_events = PopularEventSerializer(many=True)
    category_distribution = CategoryDistributionSerializer(many=True)
    organizer_stats = OrganizerStatSerializer(many=True)
    event_status_distribution = EventStatusDistributionSerializer()

class ActiveUserSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    role = serializers.CharField()
    events_registered = serializers.IntegerField()
    events_organized = serializers.IntegerField()
    total_engagement = serializers.IntegerField()
    last_login = serializers.DateTimeField(allow_null=True)

class UserGrowthSerializer(serializers.Serializer):
    month = serializers.DateTimeField()
    count = serializers.IntegerField()

class AdminUserAnalyticsSerializer(serializers.Serializer):
    active_users = ActiveUserSerializer(many=True)
    user_growth = UserGrowthSerializer(many=True)
    role_distribution = serializers.DictField(child=serializers.IntegerField())