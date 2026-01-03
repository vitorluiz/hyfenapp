"""
Management command para popular o banco de dados com 5 usuários e 5 propriedades.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import Tenant, TenantMembership
from apps.properties.models import Property, RoomType, Room
from django.utils.text import slugify
from decimal import Decimal
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Popula o banco de dados com 5 usuários, 5 empresas e 5 propriedades'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Limpando banco de dados...'))
        
        # Limpar dados existentes (Users não-superuser, Tenants, Properties)
        Property.objects.all().delete()
        Tenant.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        
        self.stdout.write(self.style.SUCCESS('Dados antigos removidos.'))

        self.stdout.write(self.style.NOTICE('Criando 5 novos usuários e empresas...'))

        users_data = [
            {'name': 'Ana Silva', 'email': 'ana@pousada.com', 'type': 'Pousada Sol'},
            {'name': 'Carlos Souza', 'email': 'carlos@hotel.com', 'type': 'Hotel Central'},
            {'name': 'Beatriz Costa', 'email': 'beatriz@chale.com', 'type': 'Chalé da Serra'},
            {'name': 'Daniel Oliveira', 'email': 'daniel@resort.com', 'type': 'Eco Resort'},
            {'name': 'Elena Lima', 'email': 'elena@hostel.com', 'type': 'Hostel Vida'},
        ]

        for i, data in enumerate(users_data, 1):
            # 1. Criar Usuário
            first_name = data['name'].split()[0]
            last_name = data['name'].split()[1]
            username = data['email']
            
            user = User.objects.create(
                username=username,
                email=username,
                first_name=first_name,
                last_name=last_name,
                cpf=f'{random.randint(100,999)}.{random.randint(100,999)}.{random.randint(100,999)}-{random.randint(10,99)}',
                phone=f'(11) 9{random.randint(1000,9999)}-{random.randint(1000,9999)}',
                is_active=True
            )
            user.set_password('12345678')
            user.save()
            
            self.stdout.write(f'  User {i}: {user.email} (senha: 12345678)')

            # 2. Criar Tenant (Empresa)
            tenant_name = f"Empresa {data['type']}"
            tenant = Tenant.objects.create(
                owner=user,
                name=tenant_name,
                slug=slugify(tenant_name),
                is_active=True
            )
            
            # Membership
            TenantMembership.objects.create(
                user=user,
                tenant=tenant,
                role='owner'
            )
            
            self.stdout.write(f'    -> Tenant: {tenant.name}')

            # 3. Criar Propriedade
            property_name = data['type']
            cnpj = f'{random.randint(10,99)}.{random.randint(100,999)}.{random.randint(100,999)}/0001-{random.randint(10,99)}'
            
            prop = Property.objects.create(
                tenant=tenant,
                name=property_name,
                slug=slugify(property_name),
                description=f'Uma linda propriedade: {property_name}',
                address=f'Rua Exemplo, {i*100}',
                city='Cidade Exemplo',
                state='SP',
                zip_code='01000-000',
                phone=user.phone,
                email=user.email,
                is_active=True,
                documento=cnpj,
                razao_social=f'{property_name} LTDA',
                telefone_contato=user.phone,
                email_contato=user.email,
                horario_funcionamento='08:00 - 22:00'
            )
            
            self.stdout.write(f'    -> Propriedade: {prop.name}')
            
            # 4. Criar Quartos
            rt = RoomType.objects.create(
                property=prop,
                name='Standard',
                description='Quarto padrão',
                base_price=Decimal('200.00'),
                max_guests=2
            )
            
            Room.objects.create(room_type=rt, number='101', floor=1, is_active=True)
            Room.objects.create(room_type=rt, number='102', floor=1, is_active=True)

        self.stdout.write(self.style.SUCCESS('\nConcluído! 5 usuários e 5 propriedades criados.'))
        self.stdout.write(self.style.SUCCESS('Todos os usuários têm a senha: "12345678"'))
