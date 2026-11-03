// Componente: lista de posts com rolagem infinita
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import api, { apiError } from '@/services/api';
import Post from '@/components/Post';

// Quantidade de posts carregados por vez
const PAGE_SIZE = 10;

// Lista de posts com rolagem infinita
// feed     = 'foryou' (todos os posts) ou 'following' (somente quem o usuário segue)
// endpoint = rota da API que devolve { posts } paginado (padrão: /posts; concursos usam /raffles/:id/posts)
// emptyKey = chave de tradução do texto exibido quando não há posts
export default function FeedList({ feed = 'foryou', endpoint = '/posts', emptyKey }) {
    const { t } = useTranslation();

    // Posts carregados até agora e estado da requisição
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Elemento invisível no fim da lista: quando aparece na tela, carrega a próxima página
    const sentinelRef = useRef(null);
    // Refs evitam requisições duplicadas (ex.: StrictMode) e guardam o deslocamento atual
    const offsetRef = useRef(0);
    // Evita requisições duplicadas (ex.: StrictMode)
    const loadingRef = useRef(false);

    // Busca a próxima página de posts e a junta com as já carregadas
    const loadMore = useCallback(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError('');

        try {
            const response = await api.get(endpoint, {
                params: { feed, limit: PAGE_SIZE, offset: offsetRef.current }
            });

            const received = response.data.posts ?? [];

            // Junta com os já carregados, ignorando eventuais duplicados
            setPosts((previous) => {
                const known = new Set(previous.map((post) => post.post_id));
                return [...previous, ...received.filter((post) => !known.has(post.post_id))];
            });

            offsetRef.current += received.length;
            setHasMore(received.length === PAGE_SIZE);
        } catch (err) {
            console.error('Erro ao carregar o feed:', err);
            setError(apiError(err, t('feed.error')));
            setHasMore(false);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, [feed, endpoint, t]);

    // Observa o elemento do fim da lista e dispara o carregamento quando ele fica visível
    // O observer é recriado a cada mudança, assim ele dispara de novo se a lista ainda for curta
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
    }, [hasMore, posts.length, loadMore]);

    return (
        <article className="w-full flex flex-col justify-center items-center gap-4 mx-auto">

            {posts.map((post) => (
                <Post
                    key={post.post_id}
                    author={post.author?.user_id}
                    authorname={post.author?.name}
                    authorusername={post.author?.username}
                    authoravatar_url={post.author?.avatar_url}

                    post_id={post.post_id}
                    post_title={post.post_title}
                    post_content={post.post_content}
                    createdAt={post.createdAt}

                    is_nsfw={post.is_nsfw}

                    media={post.media}

                    likesCount={post.likesCount}
                    commentsCount={post.commentsCount}
                    repostsCount={post.repostsCount}
                    likedByMe={post.likedByMe}
                    repostedByMe={post.repostedByMe}
                    reportedByMe={post.reportedByMe}
                    post_analysis_status={post.post_analysis_status}
                    is_raffle={post.is_raffle}
                    raffle={post.raffle}

                    tags={post.tags}
                />
            ))}

            {/* Marcador de fim de lista (observado pelo IntersectionObserver) */}
            {hasMore && <div ref={sentinelRef} className="h-1 w-full" />}

            {loading && <p className="text-cinza text-sm py-4">{t('profile.loading')}</p>}
            {error && <p className="text-destaque text-sm py-4">{error}</p>}
            {!loading && !error && posts.length === 0 && !hasMore && (
                <p className="text-cinza text-sm py-8 text-center px-4">
                    {t(emptyKey ?? (feed === 'following' ? 'feed.empty_following' : 'feed.empty'))}
                </p>
            )}

        </article>
    );
}
