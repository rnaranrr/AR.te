import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { ArrowLeft } from 'lucide-react';

import '@/components/form/forms.css';

export default function ProfileForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Mantém os campos controlados pelo React
    const [formData, setFormData] = useState({
        nickname: '',
        username: '',
        bio: '',
        pronouns: '',
        artist_type: ''
    });

    // Guarda os arquivos selecionados para enviar junto dos demais campos
    const [avatarFile, setAvatarFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    const [avatarPreview, setAvatarPreview] = useState('');
    const [bannerPreview, setBannerPreview] = useState('');

    // Carrega os dados atuais do perfil
    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get('/users/me');
                const user = response.data;

                // Converte os dados da API para os nomes usados pelo formulário
                setFormData({
                    nickname: user.nickname || '',
                    username: user.username || '',
                    bio: user.bio || '',
                    pronouns: user.pronouns || '',
                    artist_type: user.artist_type || ''
                });
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                setError(t('profileform.load_error'));
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    // Cria e limpa as prévias das imagens selecionadas
    useEffect(() => {
        if (!avatarFile) {
            setAvatarPreview('');
            return;
        }

        const url = URL.createObjectURL(avatarFile);
        setAvatarPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [avatarFile]);

    //exata msm coisa pro banner
    useEffect(() => {
        if (!bannerFile) {
            setBannerPreview('');
            return;
        }

        const url = URL.createObjectURL(bannerFile);
        setBannerPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [bannerFile]);

    // Atualiza o campo correspondente usando o atributo name do input
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    // Aceita apenas imagens dos formatos permitidos e dentro do limite de tamanho
    function handleImageChange(event, type) {
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

        if (type === 'avatar') {
            setAvatarFile(file);
        } else {
            setBannerFile(file);
        }
    }

    // Envio do formulário
    async function handleSubmit(event) {
        event.preventDefault();

        // Envia os campos textuais e as imagens em uma requisição
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const data = new FormData();

            data.append('nickname', formData.nickname);
            data.append('username', formData.username);
            data.append('bio', formData.bio);
            data.append('pronouns', formData.pronouns);
            data.append('artist_type', formData.artist_type);

            if (avatarFile) {
                data.append('avatar', avatarFile);
            }

            if (bannerFile) {
                data.append('banner', bannerFile);
            }

            await api.put('/users/me', data);

            setSuccess(t('profileform.update_success'));

            navigate('/profile');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);

            setError(
                error.response?.data?.message ||
                t('profileform.update_error')
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <aside className="w-full min-h-dvh bg-fundo text-texto-main p-6">
                {t('profile.loading')}
            </aside>
        );
    }

    return (
        <aside className="flex justify-center items-center min-h-dvh bg-fundo w-full font-principal p-4">
            <div className="card align-self-center my-auto w-full max-w-md bg-fundo p-6 flex flex-col items-center">

                {/* navbar*/}
                <div className='navbar font-principal sticky top-0 bg-fundo align-center mb-4'>

                    {/* Botão para voltar pro feed*/}
                    <div className='flex gap-2 pt-3 pl-2'>
                        <NavLink
                            to='/profile'
                            className='btn btn-lang w-10'
                        >
                            <ArrowLeft />
                        </NavLink>
                    </div>

                    {/* username */}
                    <div className='mr-6 flex w-full justify-center flex-row items-center'>
                        <h1 className='text-xl mt-2 font-bold text-texto-main h-fit'>{t('profile.edit')}</h1>
                    </div>
                </div>

                <div className="w-full mt-6">
                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4"
                    >
                        {/* Banner */}
                        <fieldset className="fieldset inputlabel">
                            <label>{t('profileform.banner_label')}</label>
                            {bannerPreview ? (
                                <img
                                    src={bannerPreview}
                                    className="w-full h-36 object-cover rounded-xl"
                                />
                            ) : (
                                <div className="w-full h-36 rounded-xl bg-discreto flex items-center justify-center">
                                    {t('profileform.banner_message')}
                                </div>
                            )}

                            <input
                                name="banner"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(event) =>
                                    handleImageChange(event, 'banner')
                                }
                                className="fileform"
                            />

                            <p className="desc">
                                {t('profileform.banner_filetype')}
                            </p>
                        </fieldset>

                        {/* Avatar */}
                        <fieldset className="fieldset inputlabel">
                            <label>{t('profileform.pfp_label')}</label>

                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    className="w-26 h-26 rounded-full object-cover justify-self-center mx-auto"
                                />
                            ) : (
                                <div className="w-26 h-26 rounded-full bg-discreto flex items-center justify-center text-center text-sm justify-self-center mx-auto my-4">
                                    {t('profileform.pfp_message')}
                                </div>
                            )}

                            <input
                                name="avatar"
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={(event) =>
                                    handleImageChange(event, 'avatar')
                                }
                                className="fileform"
                            />

                            <p className="desc">
                                {t('profileform.banner_filetype')}
                            </p>
                        </fieldset>

                        {/* Apelido */}
                        <fieldset className="fieldset inputlabel">
                            <label>{t('profileform.nickname')}</label>

                            <input
                                name="nickname"
                                type="text"
                                value={formData.nickname}
                                onChange={handleChange}
                                className="inputform"
                                required
                            />

                            <span className="text-sm text-cinza text-right">
                                {formData.nickname.length}/50
                            </span>
                        </fieldset>

                        {/* Nome de usuário */}
                        <fieldset className="fieldset inputlabel">
                            <label>{t('profileform.username')}</label>

                            <input
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                className="inputform"
                                required
                            />

                            <span className="text-sm text-cinza text-right">
                                {formData.username.length}/30
                            </span>
                        </fieldset>

                        {/* Pronomes */}
                        <fieldset className="fieldset inputlabel">
                            <label>{t('profileform.woke')}</label>

                            <input
                                name="pronouns"
                                type="text"
                                value={formData.pronouns}
                                onChange={handleChange}
                                className="inputform"
                                placeholder={t('profileform.wokepreset')}
                            />

                            <span className="text-sm text-cinza text-right">
                                {formData.pronouns.length}/20
                            </span>
                        </fieldset>

                        {/* Tipo */}
                        <fieldset className="fieldset inputlabel">
                            <label>{t('profileform.type')}</label>

                            <input
                                name="artist_type"
                                type="text"
                                value={formData.artist_type}
                                onChange={handleChange}
                                className="inputform"
                                placeholder={t('profileform.typepreset')}
                            />

                            <span className="text-sm text-cinza text-right">
                                {formData.artist_type.length}/20
                            </span>
                        </fieldset>

                        {/* Biografia */}
                        <fieldset className="fieldset inputlabel">
                            <label>{t('profileform.bio')}</label>

                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                className="areaformprofile"
                                maxLength={500}
                                placeholder={t('profileform.biopreset')}
                            />

                            <span className="text-sm text-cinza text-right">
                                {formData.bio.length}/500
                            </span>
                        </fieldset>

                        {/* Mensagens */}
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-500 text-sm">{success}</p>}

                        {/* Botão de salvar */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                        >
                            {saving ? t('profileform.saving') : t('profileform.save')}
                        </button>
                    </form>
                </div>
            </div>
        </aside >
    );
}
