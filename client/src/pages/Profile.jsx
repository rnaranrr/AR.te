// Página: perfil de usuário com as abas Timeline, Portfólio e Comissões
import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api from '@/services/api';
import Details from '@/pages/ProfileDetails';
import Timeline from '@/pages/Profile/Timeline';
import Media from '@/pages/Profile/Media';
import Comissions from '@/pages/Profile/Comissions';

// Carrega o perfil (próprio ou de outro usuário) e mostra a aba escolhida
export default function Profile() {

    const { t } = useTranslation();
    // Caminho atual da URL
    const location = useLocation();

    // Aba do perfil: Portfólio e Comissões são identificadas pelo final da URL
    const isMedia = location.pathname.endsWith('/media');
    const isComissions = location.pathname.endsWith('/comissions');

    // Username vindo da rota (/user/:username)
    const { username } = useParams();

    // Dados do perfil recebidos da API
    const [user, setUser] = useState(null);
    // Estado da requisição do perfil
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Sem username na rota, mostra o perfil do usuário logado
    const isOwnProfile = !username;

    const basePath = isOwnProfile
        ? '/profile'
        : `/user/${encodeURIComponent(username)}`;

    // Função que carrega o perfil (recriada quando o usuário da rota ou o idioma muda)
    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        setUser(null);

        // Busca o perfil na API (próprio ou de outro usuário) e guarda em user
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
    }, [isOwnProfile, username, t]);

    // Carrega o perfil ao abrir a tela e quando o usuário da rota muda
    useEffect(() => {loadProfile();}, [loadProfile]);

    return (

        <aside className="w-full min-h-dvh bg-fundo text-texto-main">
            {/* Detalhes do perfil */}
            {/* A key reinicia o cabeçalho quando os dados chegam (estado inicial do botão Seguir) */}
            <Details
                key={user?.id ?? 'loading'}
                user={user}
                loading={loading}
                error={error}
                isOwnProfile={isOwnProfile}
                basePath={basePath}
            />

            {/* Aba seletora de exibição */}
            {!loading && user && !error && (
                <div>
                    <div className="h-fit font-principal bg-fundo border-b border-discreto w-full flex justify-center items-center px-4 py-2">

                        <div className="join h-9 md:h-fit mb-2">

                            {/* Aba Timeline */}
                            <NavLink
                                to={basePath}
                                end
                                className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                            >
                                {t('profile.timeline')}
                            </NavLink>


                            <div className="divider divider-horizontal"></div>


                            {/* Aba Portfólio */}
                            <NavLink
                                to={`${basePath}/media`}
                                className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                            >
                                {t('profile.media')}
                            </NavLink>

                            <div className="divider divider-horizontal"></div>


                            {/* Aba Comissões */}
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
                            (<Timeline posts={user.posts ?? []} reposts={user.reposts ?? []} user={user} />)}
                </div>
            )}
        </aside>
    );
}
