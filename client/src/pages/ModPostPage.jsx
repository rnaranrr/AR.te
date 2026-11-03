// Página: post em moderação em tela cheia, com a seção de opiniões da comunidade no lugar dos comentários
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError, isLoggedIn, modConfig } from '@/services/api';
import ModBar from '@/pages/mod/ModBar';
import ModPost from '@/components/ModPost';
import OpinionSection from '@/components/mod/OpinionSection';

// Carrega o post em moderação da URL e mostra o card (status e voto) com as opiniões abaixo
export default function ModPostPage() {
    // Função de tradução dos textos
    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Id do post vindo da rota /mod/:postid
    const { postid } = useParams();

    // Post e opiniões carregados da API e estado da requisição
    const [post, setPost] = useState(null);
    const [opinions, setOpinions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Busca o post e as opiniões sempre que o id da URL mudar
    useEffect(() => {
        let isMounted = true;

        // Usuários logados usam o token de usuário; moderadores sem login de usuário, o de moderador
        async function loadPost() {
            setLoading(true);
            setError('');
            setPost(null);

            try {
                const response = await api.get(`/mod/posts/${postid}`, isLoggedIn() ? undefined : modConfig());

                if (isMounted) {
                    setPost(response.data.post);
                    setOpinions(response.data.opinions ?? []);
                }
            } catch (err) {
                console.error('Erro ao carregar post em moderação:', err);
                if (isMounted) setError(apiError(err, t('mod.post_not_found')));
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadPost();
        return () => {
            isMounted = false;
        };
    }, [postid, t]);

    // Atualiza o status mostrado depois que o moderador o altera
    function handleStatusChange(_postId, status) {
        setPost((current) => ({ ...current, post_analysis_status: status }));
    }

    // Atualiza o número de denúncias depois de um voto
    // Se o post voltou ao padrão (sem denúncias), ele sai da moderação e a tela volta para a lista
    function handleReportChange(_postId, data) {
        if (data.post_analysis_status === 'default') {
            navigate('/mod', { replace: true });
            return;
        }

        setPost((current) => ({
            ...current,
            ReportCount: data.reportCount,
            reportedByMe: data.reported,
            post_analysis_status: data.post_analysis_status
        }));
    }

    return (
        <main className="w-full min-h-fit bg-fundo text-texto-main">

            {/* Barra do moderador */}
            <ModBar />

            {/* Botão de voltar para a lista de posts denunciados */}
            <div className="w-full mx-auto px-4 pt-6">
                <button
                    type="button"
                    onClick={() => navigate('/mod')}
                    className="flex items-center gap-2 text-texto-main hover:text-destaque transition-colors"
                >
                    <ArrowLeft size={22} />
                    <span>{t('common.back')}</span>
                </button>
            </div>

            {loading && <p className="px-4 pt-6">{t('profile.loading')}</p>}
            {!loading && error && <p className="px-4 pt-6 text-destaque">{error}</p>}

            {/* Post e opiniões */}
            {post && (
                <section className="w-full mx-auto mt-4 pb-24 md:pb-6">
                    {/* O mesmo card da lista, com status, número de denúncias e voto */}
                    <ModPost
                        key={post.post_id}
                        authorname={post.author?.name}
                        authorusername={post.author?.username}
                        authoravatar_url={post.author?.avatar_url}

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

                    {/* Opiniões no lugar dos comentários */}
                    <OpinionSection
                        postId={post.post_id}
                        opinions={opinions}
                        onAdd={(opinion) => setOpinions((current) => [opinion, ...current])}
                        onRemove={(opinionId) => setOpinions((current) => current.filter((item) => item.opinion_id !== opinionId))}
                    />
                </section>
            )}

        </main>
    );
}
