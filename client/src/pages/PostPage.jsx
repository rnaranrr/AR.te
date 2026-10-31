// Página: post individual com comentários (ou participações, se for um raffle)
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError } from '@/services/api';
import Post from '@/components/Post';
import Comments from '@/components/comments/CommentSection';
import RaffleSection from '@/components/raffle/RaffleSection';

// Carrega o post da URL e mostra a seção correspondente abaixo dele
export default function PostPage() {
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Id do post vindo da rota /post/:id
    const { id } = useParams();

    // Post carregado da API
    const [post, setPost] = useState(null);
    // Estado da requisição
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Busca o post sempre que o id da URL mudar
    useEffect(() => {
        let isMounted = true;

        async function loadPost() {
            setLoading(true);
            setError('');
            setPost(null);

            try {
                const response = await api.get(`/posts/${id}`);
                if (isMounted) setPost(response.data.post);
            } catch (err) {
                console.error('Erro ao carregar post:', err);
                if (isMounted) setError(apiError(err, t('post.not_found')));
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadPost();
        return () => {
            isMounted = false;
        };
    }, [id, t]);

    return (
        <main className="w-full min-h-fit bg-fundo text-texto-main">

            {/* Cabeçalho */}
            <div className="w-full mx-auto px-4 pt-6">
                {/* Botão de voltar */}
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-texto-main hover:text-destaque transition-colors"
                >
                    <ArrowLeft size={22} />
                    <span>Voltar</span>
                </button>
            </div>

            {loading && <p className="px-4 pt-6">{t('profile.loading')}</p>}
            {!loading && error && <p className="px-4 pt-6 text-red-500">{error}</p>}

            {/* Post */}
            {post && (
                <section className="w-full  mx-auto mt-4">
                    {/* Key força o Post a reiniciar seus estados (like/repost) ao trocar de post */}
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
                        is_raffle={post.is_raffle}
                        raffle={post.raffle}
                        tags={post.tags}
                    />

                    {/* Concurso: participações no lugar dos comentários */}
                    {post.is_raffle
                        ? <RaffleSection key={post.raffle_id} raffleId={post.raffle_id} postId={post.post_id} />
                        : <Comments postId={post.post_id} />}
                </section>
            )}

        </main>
    );
}
