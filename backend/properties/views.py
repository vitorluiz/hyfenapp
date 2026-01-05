from rest_framework import viewsets, generics, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Property, Accommodation
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateSerializer,
    PropertyPublicSerializer,
    AccommodationSerializer
)


class PropertyViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD de propriedades.
    
    Apenas o owner pode ver e gerenciar suas propriedades.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action == 'create':
            return PropertyCreateSerializer
        return PropertyDetailSerializer
    
    def get_queryset(self):
        """Retorna apenas propriedades do usuário autenticado"""
        return Property.objects.filter(
            owner=self.request.user,
            is_active=True
        ).select_related('owner').prefetch_related('accommodations').order_by('-created_at')
    
    def perform_create(self, serializer):
        """Associa a propriedade ao usuário autenticado"""
        serializer.save(owner=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete da propriedade"""
        instance.soft_delete()


class PropertyPublicView(generics.RetrieveAPIView):
    """
    Public view for property details (no authentication required).
    
    Lookup by slug for SEO-friendly URLs.
    """
    serializer_class = PropertyPublicSerializer
    permission_classes = []  # No authentication required
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Return only active properties"""
        return Property.objects.filter(is_active=True).select_related('owner')


class AccommodationViewSet(viewsets.ModelViewSet):
    """
    ViewSet para CRUD de acomodações.
    
    Apenas o owner da propriedade pode gerenciar.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AccommodationSerializer
    
    def get_queryset(self):
        """Retorna apenas acomodações das propriedades do usuário"""
        return Accommodation.objects.filter(
            property__owner=self.request.user,
            is_active=True
        ).select_related('property').order_by('-created_at')
    
    def perform_destroy(self, instance):
        """Soft delete da acomodação"""
        instance.is_active = False
        instance.deleted_at = timezone.now()
        instance.save()
