import django_filters
from django.db.models import Q
from .models import Event

class EventFilter(django_filters.FilterSet):
    search = django_filters.CharFilter(method='filter_search')
    category = django_filters.CharFilter(field_name="category__name", lookup_expr="iexact")
    location = django_filters.CharFilter(field_name="location", lookup_expr="icontains")
    start_date = django_filters.DateFilter(field_name='start_time', lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name='start_time', lookup_expr='lte')
    class Meta:
        model = Event
        fields = {
            "category__name": ["iexact", "icontains"],
            "location": ["icontains"],
            "start_time": ["gte"],
            "end_time": ["lte"],
        }

    def filter_search(self, qs, name, value):
        return qs.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(location__icontains=value)
        )