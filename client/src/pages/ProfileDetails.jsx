import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleUser, ArrowLeft, Dot } from 'lucide-react';

import api, { assetUrl, isLoggedIn } from '@/services/api';

import '@/pages/Profile.css';

export default function ProfileDetails({
    user,
    loading,
    error,
    isOwnProfile
}) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Estado do botão "Seguir" (valores iniciais vêm da API; o Profile.jsx remonta este componente ao carregar)
    const [isFollowing, setIsFollowing] = useState(Boolean(user?.isFollowing));
    const [followersCount, setFollowersCount] = useState(user?.followersCount || 0);
    const [followPending, setFollowPending] = useState(false);

    // Segue / deixa de seguir o usuário do perfil
    async function toggleFollow() {
        // Seguir exige login
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        if (followPending) return;
        setFollowPending(true);

        try {
            const response = await api.post(`/users/${encodeURIComponent(user.username)}/follow`);

            setIsFollowing(response.data.following);
            setFollowersCount(response.data.followersCount);
        } catch (err) {
            console.error('Erro ao seguir usuário:', err);
        } finally {
            setFollowPending(false);
        }
    }

    if (loading) {
        return <p>{t('profile.loading')}</p>;
    }

    if (error || !user) {
        return <p>{t(error || 'profile.loading_failed')}</p>;
    }

    return (
        <aside className='w-full'>
            {/* navbar de navegação mobile */}
            <div className='navbar md:hidden font-principal sticky top-0 z-50 bg-fundo'>

                {/* Botão para voltar pro feed*/}
                <div className='flex gap-2 pt-3 pl-2 fixed top-0 left-0 z-[999]'>
                    <NavLink
                        to='/feed'
                        className='btn btn-lang w-10'
                    >
                        <ArrowLeft />
                    </NavLink>
                </div>

                {/* username */}

                <div className='mr-1 flex w-full justify-center flex-row items-center'>
                    <h1 className='text-lg text-texto-main h-fit'>@{user.username}</h1>
                </div>

            </div>

            {/* exibição do perfil */}
            <div className="profile-card">

                {/* banner do usuário */}
                {user.banner_url ? (
                    <img
                        src={assetUrl(user.banner_url)}
                        className="profile-banner"
                    />
                ) : (
                    <div className="profile-banner" />
                )}

                {/* Informações do perfil */}
                <div className="profile-info">

                    {/* imagem de perfil do usuário */}
                    {user.avatar_url ? (
                        <img
                            src={assetUrl(user.avatar_url)}
                            className="profile-avatar"
                        />
                    ) : (
                        <CircleUser className='profile-avatar' />
                    )}

                    {/* detalhes do perfil */}
                    <div className="profile-details">

                        <div className='flex flex-row gap-2'>
                            <p className='font-bold'>{user.nickname}</p>
                            <p className='text-cinza'>@{user.username}</p>
                        </div>

                        <span className="profile-pronouns">
                            <p>{user.pronouns || ''}</p>
                            {user.pronouns ? (<Dot />) : ('')}
                            <p>{user.artist_type || ''}</p>
                        </span>

                    </div>

                    {/* estatisticas do perfil */}
                    <div className="profile-stats">
                        <div>
                            <strong>{user.posts?.length || 0}</strong>
                            <span>{t('profile.posts')}</span>
                        </div>

                        <div>
                            <strong>{followersCount}</strong>
                            <span>{t('profile.followers')}</span>
                        </div>

                        <div>
                            <strong>{user.followingCount || 0}</strong>
                            <span>{t('profile.following')}</span>
                        </div>
                    </div>

                    {/* biografia do perfil */}
                    <p className='profile-bio'>
                        {user.bio || ''}
                    </p>
                </div>

                {isOwnProfile ?(
                    <div className="grid grid-cols-2 gap-2 mx-2 mb-2 md:mb-0">
                        <NavLink
                            to="/profile/edit"
                            className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                        >
                            {t('profile.edit')}
                        </NavLink>

                        <NavLink
                            to="/profile/comissions/edit"
                            className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                        >
                            {t('profile.edit_comissions')}
                        </NavLink>
                    </div>


                ) : (
                    <div className="grid grid-cols-2 gap-2 mx-2 mb-2 md:mb-0">
                        {/* Seguir / Seguindo: mesmo estilo dos botões originais, invertendo as cores conforme o estado */}
                        <button
                            type="button"
                            onClick={toggleFollow}
                            disabled={followPending}
                            className={isFollowing
                                ? "btn bg-fundo font-bold hover:bg-discreto/90 border-2 border-cinza rounded-full mt-2 w-full"
                                : "btn bg-cinza text-[#f1f1e7] font-bold hover:bg-discreto/90 border-2 border-cinza rounded-full mt-2 w-full"}
                        >
                            {isFollowing ? 'Seguindo' : 'Seguir'}
                        </button>

                        {/* Abre a conversa direta com o usuário */}
                        <NavLink
                            to={`/chat/${encodeURIComponent(user.username)}`}
                            className="btn bg-fundo font-bold hover:bg-discreto/90 border-2 border-cinza rounded-full mt-2 w-full"
                        >
                            Mensagens
                        </NavLink>
                    </div>
                )}
            </div>
        </aside>
    );
}
