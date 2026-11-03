// Página: lista de seguidores e de quem o perfil segue (abas "Seguidores" e "Seguindo")
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Navigate, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError, getStoredUser } from '@/services/api';
import ListElement from '@/components/messages/ListElement';

import '@/pages/Profile.css';

// Quantidade de usuários carregados por vez
const PAGE_SIZE = 20;

// Lista paginada (rolagem infinita) de seguidores ou de seguidos, com o mesmo estilo da lista de mensagens
// kind = 'followers' ou 'following'; a key no componente pai reinicia a lista ao trocar de aba
function FollowUsers({ username, kind }) {
    // Função de tradução dos textos
    const { t } = useTranslation();

    // Usuários carregados até agora e estado da requisição
    const [users, setUsers] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Elemento invisível no fim da lista: quando aparece na tela, carrega a próxima página
    const sentinelRef = useRef(null);
    // Refs guardam o deslocamento atual e evitam requisições duplicadas
    const offsetRef = useRef(0);
    const loadingRef = useRef(false);

    // Busca a próxima página e a junta com as já carregadas
    const loadMore = useCallback(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError('');

        try {
            const response = await api.get(`/users/${encodeURIComponent(username)}/${kind}`, {
                params: { limit: PAGE_SIZE, offset: offsetRef.current }
            });

            const received = response.data.users ?? [];

            // Junta com os já carregados, ignorando eventuais duplicados
            setUsers((previous) => {
                const known = new Set(previous.map((user) => user.user_id));
                return [...previous, ...received.filter((user) => !known.has(user.user_id))];
            });

            offsetRef.current += received.length;
            setHasMore(received.length === PAGE_SIZE && offsetRef.current < (response.data.total ?? Infinity));
        } catch (err) {
            console.error('Erro ao carregar a lista:', err);
            setError(apiError(err, t('follows.error')));
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [username, kind, t]);

    // Carrega a próxima página quando o fim da lista fica visível
    useEffect(() => {
        if (!hasMore || !sentinelRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { rootMargin: '400px' }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [hasMore, users.length, loadMore]);

    return (
        <div className='card md:border-1 border-discreto h-full md:max-w-xl w-full mb-4'>
            {users.map((user) => (
                <ListElement
                    key={user.user_id}
                    to={`/user/${encodeURIComponent(user.username)}`}
                    sendername={user.name}
                    senderusername={user.username}
                    senderavatar_url={user.avatar_url}
                />
            ))}

            {/* Marcador de fim de lista (observado pelo IntersectionObserver) */}
            {hasMore && <div ref={sentinelRef} className="h-1 w-full" />}

            {loading && <p className='text-sm text-cinza text-center w-full py-4'>{t('profile.loading')}</p>}
            {error && <p className='text-sm text-destaque text-center w-full py-4'>{error}</p>}
            {!loading && !error && users.length === 0 && !hasMore && (
                <p className='text-sm text-cinza text-center w-full py-4'>
                    {t(kind === 'followers' ? 'follows.empty_followers' : 'follows.empty_following')}
                </p>
            )}
        </div>
    );
}

// Mostra as abas "Seguidores" e "Seguindo" de um perfil (próprio ou de outro usuário)
export default function FollowList() {
    // Função de tradução dos textos
    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();
    // Caminho atual da URL (define a aba ativa)
    const location = useLocation();
    const params = useParams();

    // Perfil próprio (/profile/...) usa o usuário logado; perfil de outra pessoa (/user/:username/...) usa o username da rota
    const isOwnProfile = !params.username;
    const username = params.username ?? getStoredUser()?.username;

    // Sem username não há perfil para listar
    if (!username) return <Navigate to="/login" replace />;

    const basePath = isOwnProfile ? '/profile' : `/user/${encodeURIComponent(username)}`;

    // Aba ativa: /following mostra quem o perfil segue; /followers mostra os seguidores
    const kind = location.pathname.endsWith('/following') ? 'following' : 'followers';

    return (
        <aside className="flex justify-center items-start min-h-dvh bg-fundo w-full font-principal">
            <div className="w-full h-full bg-fundo flex flex-col items-center">

                {/* Barra superior com o botão de voltar, o @username e as abas */}
                <div className='navbar font-principal sticky top-0 bg-fundo align-center mb-4 flex flex-col z-999 border-b-1 border-discreto'>
                    <div className='relative w-full flex items-center justify-center'>
                        {/* Botão de voltar ao perfil */}
                        <button
                            type='button'
                            onClick={() => navigate(basePath)}
                            aria-label={t('common.back')}
                            className='absolute left-4 hover:text-destaque transition-colors'
                        >
                            <ArrowLeft size={22} />
                        </button>

                        <p className='my-4 font-bold text-lg'>@{username}</p>
                    </div>

                    <div className="join h-9 md:h-fit mb-2">
                        {/* Aba Seguidores */}
                        <NavLink
                            to={`${basePath}/followers`}
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('profile.followers')}
                        </NavLink>

                        <div className="divider divider-horizontal"></div>

                        {/* Aba Seguindo */}
                        <NavLink
                            to={`${basePath}/following`}
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('profile.following')}
                        </NavLink>
                    </div>
                </div>

                {/* Lista da aba ativa (a key reinicia a lista ao trocar de aba ou de perfil) */}
                <FollowUsers key={`${username}-${kind}`} username={username} kind={kind} />
            </div>
        </aside>
    );
}
