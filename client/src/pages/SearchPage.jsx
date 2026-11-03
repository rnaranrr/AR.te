// Página: pesquisa de usuários, posts e #tags
import { useEffect, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, ArrowUpRight, CircleUser } from 'lucide-react';

import api, { apiError, assetUrl } from '@/services/api';
import Post from '@/components/Post';

import '@/components/form/forms.css';

// Pesquisas recentes ficam salvas no navegador
const RECENT_KEY = 'recentSearches';
const MAX_RECENT = 5;

// Lê as pesquisas recentes salvas no navegador
function readRecent() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
        return [];
    }
}

// Campo de pesquisa, pesquisas recentes e resultados
export default function SearchPage() {

    const { t } = useTranslation();

    // O termo pesquisado fica na URL (/search?q=...), assim as tags dos posts (#tag) abrem direto a pesquisa
    const [searchParams, setSearchParams] = useSearchParams();
    const query = (searchParams.get('q') ?? '').trim();

    // Texto digitado no campo (só vira pesquisa ao enviar o formulário)
    const [input, setInput] = useState(query);

    // Resultado da pesquisa (null = nenhuma pesquisa ativa) e estado da requisição
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [recent, setRecent] = useState(readRecent);

    // Executa a pesquisa sempre que o termo da URL mudar
    useEffect(() => {
        setInput(query);

        if (query.replace(/^[@#]/, '').length < 2) {
            setResults(null);
            return;
        }

        let isMounted = true;

        async function runSearch() {
            setLoading(true);
            setError('');

            try {
                const response = await api.get('/search', { params: { q: query } });
                if (isMounted) setResults(response.data);
            } catch (err) {
                console.error('Erro na pesquisa:', err);
                if (isMounted) setError(apiError(err, t('search.error')));
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        runSearch();
        return () => {
            isMounted = false;
        };
    }, [query, t]);

    // Guarda o termo nas pesquisas recentes (sem repetir, máximo de 5)
    function saveRecent(term) {
        const next = [term, ...recent.filter((item) => item !== term)].slice(0, MAX_RECENT);

        setRecent(next);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    }

    // Remove um termo das pesquisas recentes
    function removeRecent(term) {
        const next = recent.filter((item) => item !== term);

        setRecent(next);
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    }

    // Envia a pesquisa: guarda nos recentes e coloca o termo na URL
    function handleSubmit(event) {
        event.preventDefault();

        const term = input.trim();
        if (!term) return;

        saveRecent(term);
        setSearchParams({ q: term });
    }

    return (

        <main className="flex min-h-dvh w-full min-w-0 justify-center bg-fundo font-principal text-texto-main">
            <div className="flex min-h-dvh w-full min-w-0 max-w-3xl flex-col border-x border-discreto bg-fundo">

                {/* Campo de pesquisa */}
                <form
                    onSubmit={handleSubmit}
                    className="flex shrink-0 pt-8 items-center justify-center gap-3 border-t border-discreto bg-fundo px-4 py-3 pb-4"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder={t('search.placeholder')}
                        className="inputform min-w-0 flex-1"
                    />
                    <button
                        type="submit"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-destaque font-bold text-fundo transition-opacity hover:opacity-85"
                    >
                        <Search />
                    </button>
                </form>

                {/* Sem pesquisa ativa: mostra as pesquisas recentes */}
                {!query && recent.map((term) => (
                    <div key={term} className='text-sm text-cinza mt-2 px-4 flex flex-row gap-4 items-center w-full'>

                        <button type="button" onClick={() => removeRecent(term)} aria-label={t('search.remove')}>
                            <X />
                        </button>
                        <p>{term}</p>

                        <button
                            type="button"
                            onClick={() => setSearchParams({ q: term })}
                            className='justify-self-right ml-auto'
                            aria-label={t('search.submit')}
                        >
                            <ArrowUpRight />
                        </button>
                    </div>
                ))}

                {/* Resultados */}
                {loading && <p className="text-cinza text-sm text-center py-6">{t('profile.loading')}</p>}
                {error && <p className="text-destaque text-sm text-center py-6">{error}</p>}

                {query && !loading && !error && results === null && (
                    <p className="text-cinza text-sm text-center py-6">{t('search.min_chars')}</p>
                )}

                {results && !loading && (
                    <div className="w-full">
                        {results.users.length === 0 && results.posts.length === 0 && (
                            <p className="text-cinza text-sm text-center py-6">{t('search.no_results')}</p>
                        )}

                        {/* Usuários encontrados */}
                        {results.users.length > 0 && (
                            <section>
                                <p className="text-cinza px-4 pt-4 pb-2 text-sm">{t('search.users')}</p>

                                {results.users.map((user) => (
                                    <NavLink
                                        key={user.user_id}
                                        to={`/user/${encodeURIComponent(user.username)}`}
                                        className="bg-fundo hover:bg-discreto text-texto-main flex flex-row items-center px-4 py-3 gap-4 border-b border-discreto transition-colors duration-200 ease-in-out"
                                    >
                                        {user.avatar_url ? (
                                            <img
                                                src={assetUrl(user.avatar_url)}
                                                className="size-12 shrink-0 rounded-full object-cover"
                                            />
                                        ) : (
                                            <CircleUser className="size-12 shrink-0 rounded-full stroke-1" />
                                        )}
                                        <div className="flex min-w-0 flex-col">
                                            <p className="truncate font-bold">{user.name}</p>
                                            <p className="truncate text-cinza">@{user.username}</p>
                                        </div>
                                    </NavLink>
                                ))}
                            </section>
                        )}

                        {/* Posts encontrados */}
                        {results.posts.length > 0 && (
                            <section className="pb-20 md:pb-4">
                                <p className="text-cinza px-4 pt-4 pb-2 text-sm">{t('search.posts')}</p>

                                {results.posts.map((post) => (
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
                            </section>
                        )}
                    </div>
                )}

            </div>
        </main >
    );
}
