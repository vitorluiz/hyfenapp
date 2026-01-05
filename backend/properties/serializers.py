from rest_framework import serializers
from .models import Property, Accommodation
from accounts.serializers import UserSerializer


class PropertyListSerializer(serializers.ModelSerializer):
    """Serializer para listagem de propriedades"""
    accommodations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ['id', 'name', 'city', 'state', 'country', 'is_active', 
                  'created_at', 'accommodations_count']
        read_only_fields = ['id', 'created_at']
    
    def get_accommodations_count(self, obj):
        return obj.accommodations.filter(is_active=True).count()


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para propriedade"""
    owner = UserSerializer(read_only=True)
    accommodations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at', 'deleted_at']
    
    def get_accommodations_count(self, obj):
        return obj.accommodations.filter(is_active=True).count()


class PropertyCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de propriedade"""
    
    class Meta:
        model = Property
        exclude = ['owner', 'deleted_at', 'is_active']
        
    def validate_zip_code(self, value):
        """Validar formato do CEP"""
        if value and len(value) not in [8, 9]:
            raise serializers.ValidationError("CEP deve ter 8 ou 9 dígitos")
        return value


class PropertyPublicSerializer(serializers.ModelSerializer):
    """Serializer público (sem dados sensíveis do owner)"""
    accommodations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = ['id', 'name', 'description', 'address', 'city', 'state', 
                  'country', 'phone', 'website', 'accommodations_count']
    
    def get_accommodations_count(self, obj):
        return obj.accommodations.filter(is_active=True).count()


class AccommodationSerializer(serializers.ModelSerializer):
    """Serializer para acomodações"""
    
    class Meta:
        model = Accommodation
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at', 'deleted_at']
