'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Property {
    id: string;
    name: string;
    logo: string;
    primary_color: string;
}

export default function CustomizePropertyPage() {
    const router = useRouter();
    const params = useParams();
    const propertyId = params.id as string;
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        primary_color: '#6366f1',
        logo: null as File | null,
    });
    const [logoPreview, setLogoPreview] = useState<string>('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchProperty(token);
    }, [propertyId, router]);

    const fetchProperty = async (token: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/v1/properties/${propertyId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao carregar propriedade');
            }

            const data = await response.json();
            setProperty(data);
            setFormData({
                primary_color: data.primary_color || '#6366f1',
                logo: null,
            });
            if (data.logo) {
                setLogoPreview(data.logo);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, primary_color: e.target.value }));
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, logo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('access_token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const formDataToSend = new FormData();
            formDataToSend.append('primary_color', formData.primary_color);
            if (formData.logo) {
                formDataToSend.append('logo', formData.logo);
            }

            const response = await fetch(`${apiUrl}/api/v1/properties/${propertyId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Erro ao salvar personalização');
            }

            setSuccess('Personalização salva com sucesso!');
            setTimeout(() => {
                router.push(`/dashboard/properties/${propertyId}`);
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
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

    if (error && !property) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-2xl mx-auto">
                    <div className="glass-strong p-6 rounded-lg text-center">
                        <p className="text-error">{error}</p>
                        <Link href="/dashboard" className="text-primary hover:text-primary-hover mt-4 inline-block">
                            ← Voltar ao Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link href={`/dashboard/properties/${propertyId}`} className="text-primary hover:text-primary-hover mb-4 inline-flex items-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Voltar
                    </Link>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Personalizar Landing Page</h1>
                    <p className="text-text-secondary">{property?.name}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="glass p-6 rounded-lg space-y-6">
                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-success/10 border border-success/20 text-success p-4 rounded-lg">
                            {success}
                        </div>
                    )}

                    {/* Logo Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Logo da Marca</label>
                        <div className="space-y-4">
                            {logoPreview && (
                                <div className="flex items-center justify-center p-6 rounded-lg bg-surface border border-border">
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="max-h-32 object-contain"
                                    />
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg glass border border-border hover:glass-strong transition-all">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="font-medium">{formData.logo ? 'Trocar Logo' : 'Fazer Upload'}</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                    />
                                </label>
                                {logoPreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, logo: null }));
                                            setLogoPreview('');
                                        }}
                                        className="px-4 py-3 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors font-medium"
                                    >
                                        Remover
                                    </button>
                                )}
                            </div>
                            <p className="text-text-muted text-sm">
                                Recomendado: PNG ou SVG com fundo transparente, até 2MB
                            </p>
                        </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Cor Primária</label>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <input
                                        type="color"
                                        value={formData.primary_color}
                                        onChange={handleColorChange}
                                        className="w-20 h-20 rounded-lg cursor-pointer border-2 border-border"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={formData.primary_color}
                                        onChange={handleColorChange}
                                        placeholder="#6366f1"
                                        className="w-full px-4 py-3 rounded-lg glass border border-border focus:border-primary focus:outline-none transition-colors font-mono"
                                    />
                                    <p className="text-text-muted text-sm mt-2">
                                        Esta cor será usada em botões, links e destaques da landing page
                                    </p>
                                </div>
                            </div>

                            {/* Color Preview */}
                            <div className="p-6 rounded-lg glass border border-border">
                                <h3 className="text-sm font-medium mb-4">Preview</h3>
                                <div className="space-y-3">
                                    <button
                                        type="button"
                                        style={{ backgroundColor: formData.primary_color }}
                                        className="w-full py-3 px-6 rounded-lg text-white font-semibold"
                                    >
                                        Botão Primário
                                    </button>
                                    <p className="text-sm">
                                        Este é um <span style={{ color: formData.primary_color }} className="font-semibold">link de exemplo</span> com a cor primária
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4">
                        <Link
                            href={`/dashboard/properties/${propertyId}`}
                            className="flex-1 text-center py-3 px-6 rounded-lg glass hover:glass-strong transition-all font-medium"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 gradient-primary text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity shadow-glow disabled:opacity-50"
                        >
                            {saving ? 'Salvando...' : 'Salvar Personalização'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
