// Página: espaço de moderação com a lista de posts denunciados
import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError, isLoggedIn, isModerator, modConfig } from '@/services/api';

import '@/components/form/forms.css';

import ModBar from '@/pages/mod/ModBar';
import ModPost from '@/components/ModPost';
import Logo from '@/assets/logo/icon-logo-big.svg?react';

// Lista os posts denunciados com o número de denúncias de cada um
export default function ModPage() {

    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Posts denunciados (carregados da API)
    const [dbPosts, setDbPosts] = useState([]);
    // Estado da requisição
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // O espaço de moderação exige login de usuário ou de moderador
        if (!isLoggedIn() && !isModerator()) {
            navigate('/login');
            return;
        }

        let isMounted = true;

        // Busca a lista de posts denunciados
        async function loadReportedPosts() {
            try {
                // Usuários logados usam o token de usuário; moderadores sem login de usuário, o de moderador
                const response = await api.get('/mod/posts', isLoggedIn() ? undefined : modConfig());
                if (isMounted) setDbPosts(response.data.posts ?? []);
            } catch (err) {
                console.error('Erro ao carregar posts denunciados:', err);
                if (isMounted) setError(apiError(err, t('mod.load_error')));
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadReportedPosts();
        return () => {
            isMounted = false;
        };
    }, [t, navigate]);

    // Atualiza o status de um post depois que o moderador o altera
    function handleStatusChange(postId, status) {
        setDbPosts((current) => current.map((post) => (
            post.post_id === postId ? { ...post, post_analysis_status: status } : post
        )));
    }

    // Atualiza o número de denúncias depois de um voto
    // Se o post voltou ao padrão (sem denúncias), ele sai da lista
    function handleReportChange(postId, data) {
        setDbPosts((current) => current
            .map((post) => (
                post.post_id === postId
                    ? {
                        ...post,
                        ReportCount: data.reportCount,
                        reportedByMe: data.reported,
                        post_analysis_status: data.post_analysis_status
                    }
                    : post
            ))
            .filter((post) => post.post_analysis_status !== 'default'));
    }

    // Posts do mais denunciado para o menos denunciado (empates mantêm a ordem recebida)
    const sortedPosts = [...dbPosts].sort((a, b) => b.ReportCount - a.ReportCount);

    return (

        <aside className="flex flex-col min-h-dvh w-full justify-start bg-fundo font-principal text-texto-main mb-18">
            {/* Barra do moderador */}
            <ModBar />

            <div className='flex flex-row mt-4'>
                <div className='md:w-[50%] w-full p-4 flex-row text-center'>
                    <h1 className='font-logo text-3xl'>{t('mod.label')}</h1>
                    <p className='text-center mt-5'>{t('mod.description')}</p>
                </div>
                {/* Logo (somente em telas grandes) */}
                <Logo className='hidden md:block w-40 h-40 border-4 mt-6 border-texto rounded-2xl justify-self-center mx-auto' />
            </div>

            <p className='text-cinza pl-8 mt-8 border-t-1 border-discreto pt-4 pb-8'>{t('mod.recent')}</p>

            <div>
                {loading && <p className='text-cinza text-center'>{t('profile.loading')}</p>}
                {error && <p className='text-destaque text-center'>{error}</p>}
                {!loading && !error && dbPosts.length === 0 && (
                    <p className='text-cinza text-center'>{t('mod.empty')}</p>
                )}

                {sortedPosts.map((post) => (
                    <ModPost
                        key={post.post_id}
                        author={post.author.user_id}
                        authorname={post.author.name}
                        authorusername={post.author.username}
                        authoravatar_url={post.author.avatar_url}

                        post_id={post.post_id}
                        post_title={post.post_title}
                        post_content={post.post_content}
                        createdAt={post.createdAt}
                        post_analysis_status={post.post_analysis_status}

                        is_nsfw={post.is_nsfw}

                        media={post.media}

                        ReportCount={post.ReportCount}
                        reportedByMe={post.reportedByMe}
                        onStatusChange={handleStatusChange}
                        onReportChange={handleReportChange}

                        tags={post.tags}
                    />
                ))}
            </div>
        </aside>
    );
}
