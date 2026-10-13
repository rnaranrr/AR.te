import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api from '@/services/api';
import Details from '@/pages/ProfileDetails';
import Timeline from '@/pages/Profile/Timeline';
import Media from '@/pages/Profile/Media';
import Comissions from '@/pages/Profile/Comissions';

export default function Profile() {

    const { t } = useTranslation();
    const location = useLocation();

    //define aba de midia e comissão com base no final de url
    const isMedia = location.pathname.endsWith('/media');
    const isComissions = location.pathname.endsWith('/comissions');

    // define o username com base nos parametros decididos pela rota atual
    const { username } = useParams();

    // dados recebidos
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //caso não tenha nenhum username definido na rota, define como o perfil de pessoa logada
    const isOwnProfile = !username;

    const basePath = isOwnProfile
        ? '/profile'
        : `/user/${encodeURIComponent(username)}`;

    //
    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        setUser(null);

        // busca os dados na api independente de ser o usuário logado ou outra pessoa e os guarda em user
        try {
            const endpoint = isOwnProfile
                ? '/users/me'
                : `/users/${encodeURIComponent(username)}`;

            const response = await api.get(endpoint);
            setUser(response.data);
        } catch (err) {
            console.error('Erro ao carregar perfil:', err);

            setError(t('profile.user_not_found'));
        } finally {
            setLoading(false);
        }
    }, [isOwnProfile, username]);

    // 
    useEffect(() => {loadProfile();}, [loadProfile]);

    return (

        <aside className="w-full min-h-dvh bg-fundo text-texto-main">
            {/* Detalhes do perfil */}
            <Details
                user={user}
                loading={loading}
                error={error}
                isOwnProfile={isOwnProfile}
            />

            {/* Aba seletora de exibição */}
            {!loading && user && !error && (
                <div>
                    <div className="h-fit font-principal bg-fundo border-b border-discreto w-full flex justify-center items-center px-4 py-2">

                        <div className="join h-9 md:h-fit mb-2">

                            <NavLink
                                to={basePath}
                                end
                                className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                            >
                                {t('profile.timeline')}
                            </NavLink>


                            <div className="divider divider-horizontal"></div>


                            <NavLink
                                to={`${basePath}/media`}
                                className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                            >
                                {t('profile.media')}
                            </NavLink>

                            <div className="divider divider-horizontal"></div>


                            <NavLink
                                to={`${basePath}/comissions`}
                                className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                            >
                                {t('profile.comissions')}
                            </NavLink>

                        </div>
                    </div>

                    {/* Renderiza o conteúdo do feed com base na rota atual */}
                    {isMedia ? (<Media posts={user.posts ?? []} />) :
                        isComissions ? (<Comissions user={user} isOwnProfile={isOwnProfile} />) :
                            (<Timeline posts={user.posts ?? []} user={user} />)}
                </div>
            )}
        </aside>
    );
}
