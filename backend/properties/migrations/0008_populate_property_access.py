# Generated migration for populating PropertyAccess

from django.db import migrations


def create_property_access_for_existing(apps, schema_editor):
    """
    Cria PropertyAccess para todas as propriedades existentes.
    Associa o owner como OWNER.
    """
    Property = apps.get_model('properties', 'Property')
    PropertyAccess = apps.get_model('properties', 'PropertyAccess')
    
    created_count = 0
    for property in Property.objects.all():
        # Verificar se já existe
        exists = PropertyAccess.objects.filter(
            user=property.owner,
            property=property
        ).exists()
        
        if not exists:
            PropertyAccess.objects.create(
                user=property.owner,
                property=property,
                role='OWNER'
            )
            created_count += 1
    
    print(f'PropertyAccess criados: {created_count}')


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0007_add_property_access_model'),
    ]

    operations = [
        migrations.RunPython(
            create_property_access_for_existing,
            reverse_code=migrations.RunPython.noop
        ),
    ]
