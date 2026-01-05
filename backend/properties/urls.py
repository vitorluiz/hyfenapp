from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, PropertyPublicView, AccommodationViewSet

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'accommodations', AccommodationViewSet, basename='accommodation')

urlpatterns = [
    path('', include(router.urls)),
    path('public/properties/<slug:slug>/', PropertyPublicView.as_view(), name='property-public'),
]
