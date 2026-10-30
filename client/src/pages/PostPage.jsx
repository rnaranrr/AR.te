import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError } from '@/services/api';
import Post from '@/components/Post';
import Comments from '@/components/comments/CommentSection';

export default function PostPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { id } = useParams();

    // Post carregado da API
    const [post, setPost] = useState(null);
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
                    {/* key força o Post a reiniciar seus estados (like/repost) ao trocar de post */}
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
                        tags={post.tags}
                    />
                    <Comments postId={post.post_id} />
                </section>
            )}

        </main>
    );
}
