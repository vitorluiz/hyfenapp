from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound
from .models import Property, Room
from .serializers import PropertySerializer
from apps.reservations.models import Reservation
from django.utils import timezone
from django.db.models import Sum, Q, Count
from datetime import date
import calendar

class CurrentPropertyView(APIView):
    """
    Retorna os dados da Pousada atual baseada no domínio acessado (via DomainMiddleware).
    Endpoint: GET /api/v1/pousada/
    """
    permission_classes = [AllowAny]  # Público, pois é a 'home' do site da pousada

    def get(self, request):
        # O middleware DomainMiddleware deve injetar current_property
        property_obj = getattr(request, 'current_property', None)

        if not property_obj:
            # Se não vier do domínio, tenta pegar pelo slug na query param ?slug=... (opcional, para dev)
            slug = request.query_params.get('slug')
            if slug:
                try:
                    property_obj = Property.objects.get(slug=slug, is_active=True)
                except Property.DoesNotExist:
                    pass
        
        if not property_obj:
            raise NotFound(detail="Nenhuma pousada identificada para este domínio.")

        serializer = PropertySerializer(property_obj)
        return Response(serializer.data)

from rest_framework.permissions import IsAuthenticated

class OwnerDashboardStatsView(APIView):
    """
    Retorna estatísticas do Dashboard do Proprietário Logado.
    Endpoint: GET /api/v1/dashboard/stats/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # 1. Tenta pegar a propriedade pelo contexto do domínio (DomainMiddleware)
            current_property = getattr(request, 'current_property', None)
            
            # Se tivermos uma propriedade no contexto, verificamos se o usuário tem acesso
            # (Seja como Owner do Tenant ou Membro)
            if current_property:
                # Checar se é owner do tenant
                is_owner = current_property.tenant.owner == request.user
                # Checar se é membro (futuro)
                # is_member = current_property.tenant.memberships.filter(user=request.user).exists()
                
                if not is_owner: # and not is_member
                    return Response({"error": "Acesso não autorizado a esta propriedade."}, status=403)
            
            else:
                # 2. Se não estiver num domínio de tenant (ex: app.hyfen.com),
                # buscamos a primeira propriedade associada ao usuário.
                
                # Buscar tenants onde o user é owner
                user_tenants = request.user.owned_tenants.all()
                if not user_tenants.exists():
                     # Tentar memberships (futuro)
                     return Response({"error": "Usuário não possui pousadas cadastradas."}, status=404)
                
                # Pega a primeira propriedade do primeiro tenant (Simulando MVP Single-Property)
                # Ideal: User selecionar qual tenant quer gerenciar se tiver > 1
                tenant = user_tenants.first()
                current_property = tenant.properties.first()
                
                if not current_property:
                    return Response({"error": "Tenant não possui propriedades configuradas."}, status=404)

            # Calcular estatísticas reais
            today = timezone.now().date()
            
            # 1. Total de quartos ativos da propriedade
            total_rooms = Room.objects.filter(
                room_type__property=current_property, 
                is_active=True
            ).count()
            
            # 2. Check-ins Hoje (Status confirmado ou pendente e data checkin = hoje)
            checkins_today = Reservation.objects.filter(
                property=current_property,
                check_in=today,
                status__in=['confirmed', 'pending']
            ).count()
            
            # 3. Check-outs Hoje (Status checked_in e data checkout = hoje)
            checkouts_today = Reservation.objects.filter(
                property=current_property,
                check_out=today,
                status='checked_in'
            ).count()
            
            # 4. Quartos ocupados hoje (Reservas ativas que englobam hoje)
            # check_in <= today < check_out
            occupied_rooms = Reservation.objects.filter(
                property=current_property,
                check_in__lte=today,
                check_out__gt=today,
                status__in=['checked_in', 'confirmed']
            ).count()
            
            # Taxa de ocupação
            if total_rooms > 0:
                occupancy_rate = int((occupied_rooms / total_rooms) * 100)
            else:
                occupancy_rate = 0
                
            # 5. Receita do Mês (Reservas com check-in neste mês, não canceladas)
            first_day_month = today.replace(day=1)
            last_day_month = today.replace(day=calendar.monthrange(today.year, today.month)[1])
            
            revenue_month = Reservation.objects.filter(
                property=current_property,
                check_in__gte=first_day_month,
                check_in__lte=last_day_month
            ).exclude(
                status__in=['cancelled', 'no_show']
            ).aggregate(
                total_revenue=Sum('total_price')
            )['total_revenue'] or 0.00
            
            stats = {
                "occupancy_rate": occupancy_rate,
                "active_reservations": occupied_rooms,
                "checkins_today": checkins_today,
                "checkouts_today": checkouts_today,
                "revenue_month": float(revenue_month),
                "property_name": current_property.name
            }
            return Response(stats)

        except Exception as e:
             return Response({"error": str(e)}, status=500)
