import { useEffect, useState } from 'react';
import api from '@/services/api';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleUser, ArrowLeft } from 'lucide-react';

import '@/pages/Profile.css';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation();
    const location = useLocation();


    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await api.get('/users/me');

                console.log(response.data);

                setUser(response.data);
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    if (loading) {
        return <p>{t('profile.loading')}</p>;
    }

    if (!user) {
        return <p>{t('profile.loading_failed')}</p>;
    }

    return (
        <aside className='w-full'>
            {/* navbar de navegação mobile */}
            <div className='navbar sm:hidden font-principal sticky top-0 z-50 bg-fundo'>

                {/* Botão para voltar pro feed*/}
                <div className='flex gap-2 pt-3 pl-2 fixed top-0 left-0 z-[999]'>
                    <NavLink
                        to='/feed'
                        className='btn btn-lang w-[40px]'
                    >
                        <ArrowLeft />
                    </NavLink>
                </div>

                {/* username */}

                <div className='mr-1 flex w-[100%] justify-center flex-row items-center'>
                    <h1 className='text-lg text-texto-main h-fit'>@{user.username}</h1>
                </div>

            </div>

            {/* exibição do perfil */}
            <div className="profile-card">

                {/* banner do usuário */}
                {user.banner_url ? (
                    <img src={user.banner_url} className='profile-banner' />
                ) : (
                    <div className="profile-banner" />
                )}

                {/* Informações do perfil */}
                <div className="profile-info">

                    {/* imagem de perfil do usuário */}
                    {user.avatar_url ? (
                        <img src={user.avatar_url} className='profile-avatar' />
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
                            {user.pronouns || ''}
                        </span>

                    </div>

                    {/* estatisticas do perfil */}
                    <div className="profile-stats">
                        <div>
                            <strong>{user.posts?.length || 0}</strong>
                            <span>{t('profile.posts')}</span>
                        </div>

                        <div>
                            <strong>{user.followersCount || 0}</strong>
                            <span>{t('profile.followers')}</span>
                        </div>

                        <div>
                            <strong>{user.followingCount || 0}</strong>
                            <span>{t('profile.following')}</span>
                        </div>
                    </div>

                    {/* biografia do perfil */}
                    <p className='profile-bio'>
                        {user.bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mx-2 mb-2 sm:mb-0">
                    <NavLink
                        to='/profile/edit'
                        className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                    >
                        {t('profile.edit')}
                    </NavLink>
                    <NavLink
                        to='/profile/comissions/edit'
                        className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                    >
                        {t('profile.edit_comissions')}
                    </NavLink>
                </div>
            </div>
        </aside>
    );
}   