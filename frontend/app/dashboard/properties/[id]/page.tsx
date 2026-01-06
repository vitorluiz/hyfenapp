'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Property {
    id: string;
    name: string;
    description: string;
    city: string;
    state: string;
    country: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    slug: string;
    accommodations_count: number;
    images_count: number;
    logo: string;
    primary_color: string;
}

interface Accommodation {
    id: string;
    name: string;
    accommodation_type: string;
    max_guests: number;
    base_price: string;
    is_active: boolean;
}

export default function PropertyDashboardPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [property, setProperty] = useState<Property | null>(null);
    const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchData(token);
    }, [id, router]);

    const fetchData = async (token: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            // Buscar propriedade
            const propResponse = await fetch(`${apiUrl}/api/v1/properties/${id}/`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (propResponse.status === 401) {
                localStorage.clear();
                router.push('/login');
                return;
            }

            if (!propResponse.ok) {
                throw new Error('Erro ao carregar propriedade');
            }

            const propData = await propResponse.json();
            setProperty(propData);

            // Buscar acomodações
            const accResponse = await fetch(`${apiUrl}/api/v1/accommodations/by_property/?property_id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (accResponse.ok) {
                const accData = await accResponse.json();
                setAccommodations(accData.results || accData);
            }
        } catch (err: any) {
            console.error('Erro ao buscar dados:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.92157L16.25 7.75M4.92157 19.0784L7.75 16.25M4.92157 4.92157L7.75 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-strong p-6 rounded-lg text-center">
                        <p className="text-error">{error || 'Propriedade não encontrada'}</p>
                        <Link href="/dashboard" className="text-primary hover:text-primary-hover mt-4 inline-block">
                            ← Voltar ao Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const activeAccommodations = accommodations.filter(a => a.is_active).length;
    const totalCapacity = accommodations.reduce((sum, a) => sum + a.max_guests, 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="glass border-b border-border p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-text-secondary hover:text-text-primary">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold">{property.name}</h1>
                            <p className="text-text-secondary text-sm">{property.city}, {property.state}</p>
                        </div>
                    </div>
                    <Link
                        href={`/public/${property.slug}`}
                        target="_blank"
                        className="text-sm text-primary hover:text-primary-hover flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14M14 4H20M20 4V10M20 4L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Ver Landing Page
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="glass p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-text-secondary">Acomodações</h3>
                            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold gradient-text">{property.accommodations_count}</p>
                        <p className="text-xs text-text-muted mt-1">{activeAccommodations} ativas</p>
                    </div>

                    <div className="glass p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-text-secondary">Capacidade Total</h3>
                            <svg className="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-secondary">{totalCapacity}</p>
                        <p className="text-xs text-text-muted mt-1">hóspedes</p>
                    </div>

                    <div className="glass p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-text-secondary">Fotos</h3>
                            <svg className="w-5 h-5 text-accent" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-3xl font-bold text-accent">{property.images_count}</p>
                        <p className="text-xs text-text-muted mt-1">imagens</p>
                    </div>

                    <div className="glass p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-text-secondary">Personalização</h3>
                            <div className="w-5 h-5 rounded border-2 border-border" style={{ backgroundColor: property.primary_color }}></div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            {property.logo ? (
                                <span className="text-xs text-success">✓ Logo</span>
                            ) : (
                                <span className="text-xs text-text-muted">○ Logo</span>
                            )}
                            <span className="text-xs text-success">✓ Cor</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1 font-mono">{property.primary_color}</p>
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Link
                        href={`/dashboard/properties/${id}/accommodations`}
                        className="glass hover:glass-strong p-6 rounded-lg transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Acomodações</h3>
                            <svg className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-sm text-text-secondary">Gerenciar quartos, suítes e unidades</p>
                    </Link>

                    <Link
                        href={`/dashboard/properties/${id}/customize`}
                        className="glass hover:glass-strong p-6 rounded-lg transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Personalizar</h3>
                            <svg className="w-5 h-5 text-secondary group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-sm text-text-secondary">Logo e cor da landing page</p>
                    </Link>

                    <Link
                        href={`/dashboard/properties/${id}/edit`}
                        className="glass hover:glass-strong p-6 rounded-lg transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Editar Informações</h3>
                            <svg className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-sm text-text-secondary">Endereço, contato e redes sociais</p>
                    </Link>
                </div>

                {/* Acomodações Recentes */}
                {accommodations.length > 0 && (
                    <div className="glass p-6 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Acomodações</h2>
                            <Link
                                href={`/dashboard/properties/${id}/accommodations`}
                                className="text-sm text-primary hover:text-primary-hover"
                            >
                                Ver todas →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accommodations.slice(0, 6).map((acc) => (
                                <Link
                                    key={acc.id}
                                    href={`/dashboard/properties/${id}/accommodations/${acc.id}`}
                                    className="glass-strong hover:border-primary/50 p-4 rounded-lg transition-all border border-border"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-medium">{acc.name}</h3>
                                        {acc.is_active ? (
                                            <span className="text-xs text-success">● Ativa</span>
                                        ) : (
                                            <span className="text-xs text-text-muted">○ Inativa</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-text-secondary mb-2">{acc.accommodation_type}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-text-muted">{acc.max_guests} hóspedes</span>
                                        <span className="text-primary font-semibold">R$ {acc.base_price}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        {accommodations.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-text-secondary mb-4">Nenhuma acomodação cadastrada</p>
                                <Link
                                    href={`/dashboard/properties/${id}/accommodations/new`}
                                    className="gradient-primary text-white font-semibold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-glow inline-block"
                                >
                                    Criar Primeira Acomodação
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
