import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { ArrowLeft } from 'lucide-react';

import '@/components/form/forms.css';

export default function ComissionsForm() {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [commissionsOpen, setCommissionsOpen] = useState(false);
    
    const [currentImages, setCurrentImages] = useState({
        commissions_banner_url: '',
        commissions_image_url: ''
    });
    const [files, setFiles] = useState({
        commissions_banner: null,
        commissions_image: null
    });
    const [previews, setPreviews] = useState({
        commissions_banner: '',
        commissions_image: ''
    });

    useEffect(() => {
        let isMounted = true;

        async function loadImages() {
            try {
                const response = await api.get('/users/me');
                const user = response.data;

                if (isMounted) {
                    setCurrentImages({
                        commissions_banner_url: user.commissions_banner_url || '',
                        commissions_image_url: user.commissions_image_url || ''
                    });
                    setCommissionsOpen(Boolean(user.commissions_open));
                }
            } catch (error) {
                console.error('Erro ao carregar imagens de comissão:', error);
                if (isMounted) setError(t('profileform.load_error'));
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadImages();
        return () => {
            isMounted = false;
        };
    }, [t]);

    useEffect(() => {
        const nextPreviews = Object.fromEntries(
            Object.entries(files).map(([name, file]) => [
                name,
                file ? URL.createObjectURL(file) : ''
            ])
        );

        setPreviews(nextPreviews);

        return () => {
            Object.values(nextPreviews).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [files]);

    function handleImageChange(event, fieldName) {
        const file = event.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(t('profileform.invalid_image_type'));
            event.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(t('profileform.image_too_large'));
            event.target.value = '';
            return;
        }

        setError('');
        setSuccess('');

        setFiles((previous) => ({
            ...previous,
            [fieldName]: file
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const data = new FormData();

            Object.entries(files).forEach(([fieldName, file]) => {
                if (file) data.append(fieldName, file);
            });
            data.append('commissions_open', commissionsOpen);

            await api.put('/users/me', data);

            setSuccess(t('profileform.update_success'));
        } catch (error) {
            console.error('Erro ao atualizar imagens de comissão:', error);
            setError(
                error.response?.data?.error ||
                t('profileform.update_error')
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <aside className="w-full bg-fundo p-6 text-texto-main">
                {t('profile.loading')}
            </aside>
        );
    }

    const imageFields = [
        {
            name: 'commissions_banner',
            url: currentImages.commissions_banner_url,
            label: 'profileform.commissions_banner_label',
            emptyLabel: 'profileform.commissions_banner_message'
        },
        {
            name: 'commissions_image',
            url: currentImages.commissions_image_url,
            label: 'profileform.commissions_image_label',
            emptyLabel: 'profileform.commissions_image_message'
        }
    ];

    return (
        <aside className="flex min-h-dvh w-full justify-center bg-fundo p-4 font-principal">
            <div className="card w-full max-w-md bg-fundo p-6">
                <header className="mb-6 flex items-center gap-4">
                    <NavLink to="/profile/comissions" className="btn btn-lang w-10">
                        <ArrowLeft />
                    </NavLink>
                    <h1 className="text-xl font-bold text-texto-main">
                        {t('profileform.commissions_title')}
                    </h1>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {imageFields.map((field) => {
                        const preview = previews[field.name];
                        const existingImage = field.url
                            ? new URL(field.url, import.meta.env.VITE_API_URL).href
                            : '';

                        return (
                            <fieldset className="fieldset inputlabel" key={field.name}>
                                <label htmlFor={field.name}>{t(field.label)}</label>

                                {preview || existingImage ? (
                                    <img
                                        src={preview || existingImage}
                                        alt={t(field.label)}
                                        className="h-36 w-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="flex h-36 w-full items-center justify-center rounded-xl bg-discreto">
                                        {t(field.emptyLabel)}
                                    </div>
                                )}

                                <input
                                    id={field.name}
                                    name={field.name}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={(event) =>
                                        handleImageChange(event, field.name)
                                    }
                                    className="fileform"
                                />
                            </fieldset>
                        );
                    })}

                    <label className="inputform flex cursor-pointer flex-row gap-4">
                        <input
                            type="checkbox"
                            checked={commissionsOpen}
                            onChange={(event) => {
                                setCommissionsOpen(event.target.checked);
                                setError('');
                                setSuccess('');
                            }}
                            className="mt-1 accent-destaque"
                        />
                        <span className="font-semibold">
                            {t('profileform.commissions_open')}
                        </span>
                    </label>

                    <p className="desc">{t('profileform.banner_filetype')}</p>

                    {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                    {success && <p role="status" className="text-sm text-green-500">{success}</p>}

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn mt-2 w-full rounded-full border-none bg-destaque font-bold text-fundo hover:bg-destaque/90"
                    >
                        {saving ? t('profileform.saving') : t('profileform.save')}
                    </button>
                </form>
            </div>
        </aside>
    );
}
