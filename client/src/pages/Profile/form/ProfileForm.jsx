// Página: edição do perfil (imagens e dados pessoais) e exclusão de conta
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { apiError, assetUrl, getStoredUser } from '@/services/api';
import { ArrowLeft } from 'lucide-react';

import '@/components/form/forms.css';

// Carrega o perfil atual, envia as alterações e permite excluir a conta
export default function ProfileForm() {
    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Estado da tela: carregando, salvando e mensagens
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Exclusão de conta: a confirmação (com senha) só aparece depois de clicar em "Excluir conta"
    const [showDelete, setShowDelete] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

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

    // Imagens que o usuário já tem salvas (exibidas enquanto nenhuma nova for escolhida)
    const [currentImages, setCurrentImages] = useState({ avatar: '', banner: '' });

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

                setCurrentImages({
                    avatar: assetUrl(user.avatar_url),
                    banner: assetUrl(user.banner_url)
                });
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                setError(t('profileform.load_error'));
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [t]);

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

    // Mesma lógica para a prévia do banner
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

            const response = await api.put('/users/me', data);

            // Mantém o usuário guardado no navegador (salvo no login) sincronizado com as alterações
            localStorage.setItem('user', JSON.stringify({
                ...getStoredUser(),
                name: response.data.nickname,
                username: response.data.username,
                avatar_url: response.data.avatar_url
            }));

            setSuccess(t('profileform.update_success'));

            navigate('/profile');
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);

            // A API responde erros na chave "error" (ex.: nome de usuário já em uso)
            setError(apiError(error, t('profileform.update_error')));
        } finally {
            setSaving(false);
        }
    }

    // Encerra a sessão de usuário (apaga o token e os dados guardados no navegador) e volta para o login
    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        navigate('/login');
    }

    // Exclui a conta (e todas as produções) na API e volta para o login
    async function handleDeleteAccount() {
        if (!deletePassword || deleting) return;

        setDeleting(true);
        setDeleteError('');

        try {
            await api.delete('/users/me', { data: { password: deletePassword } });

            // A conta não existe mais: limpa a sessão guardada no navegador
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            navigate('/login');
        } catch (err) {
            console.error('Erro ao excluir conta:', err);
            setDeleteError(apiError(err, t('profileform.delete_error')));
        } finally {
            setDeleting(false);
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

                {/* Barra superior com título e botão de voltar */}
                <div className='navbar font-principal sticky top-0 bg-fundo align-center mb-4'>

                    {/* Botão de voltar */}
                    <div className='flex gap-2 pt-3 pl-2'>
                        <NavLink
                            to='/profile'
                            className='btn btn-lang w-10'
                        >
                            <ArrowLeft />
                        </NavLink>
                    </div>

                    {/* Nome de usuário (@) exibido no topo */}
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
                            {(bannerPreview || currentImages.banner) ? (
                                <img
                                    src={bannerPreview || currentImages.banner}
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

                            {(avatarPreview || currentImages.avatar) ? (
                                <img
                                    src={avatarPreview || currentImages.avatar}
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
                        {error && <p className="text-destaque text-sm">{error}</p>}
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

                    {/* Sair da conta e exclusão da conta (a exclusão pede a senha para confirmar) */}
                    <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-discreto">
                        {/* Sair da conta (encerra a sessão neste navegador) */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="btn bg-fundo font-bold hover:bg-discreto/90 border-2 border-cinza rounded-full w-full"
                        >
                            {t('sidebar.logout')}
                        </button>

                        {!showDelete ? (
                            <button
                                type="button"
                                onClick={() => setShowDelete(true)}
                                className="btn bg-fundo text-destaque font-bold border-2 border-destaque hover:bg-destaque/10 rounded-full w-full"
                            >
                                {t('profileform.delete_account')}
                            </button>
                        ) : (
                            <>
                                <p className="text-sm text-destaque">{t('profileform.delete_warning')}</p>

                                <fieldset className="fieldset inputlabel">
                                    <label htmlFor="delete-password">{t('profileform.delete_password')}</label>

                                    <input
                                        id="delete-password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={deletePassword}
                                        onChange={(event) => setDeletePassword(event.target.value)}
                                        className="inputform"
                                    />
                                </fieldset>

                                {deleteError && <p role="alert" className="text-destaque text-sm">{deleteError}</p>}

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowDelete(false);
                                            setDeletePassword('');
                                            setDeleteError('');
                                        }}
                                        className="btn bg-fundo font-bold hover:bg-discreto/90 border-2 border-cinza rounded-full w-full"
                                    >
                                        {t('profileform.delete_cancel')}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDeleteAccount}
                                        disabled={!deletePassword || deleting}
                                        className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full w-full"
                                    >
                                        {deleting ? t('profileform.deleting') : t('profileform.delete_confirm')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </aside >
    );
}
