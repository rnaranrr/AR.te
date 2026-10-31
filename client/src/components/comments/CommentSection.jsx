// Componente: seção de comentários de um post (lista e campo para comentar)
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import api, { apiError, isLoggedIn } from '@/services/api';
import Comment from '@/components/comments/Comment';
import '@/components/form/forms.css';

// Seção de comentários de um post. Recebe o id do post exibido
export default function Comments({ postId }) {
    // Função de tradução dos textos
    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Texto do campo de novo comentário
    const [comment, setComment] = useState('');

    // Lista de comentários carregados da API
    const [comments, setComments] = useState([]);
    // Estado da requisição: carregando, enviando e mensagem de erro
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // Carrega os comentários do post
    const loadComments = useCallback(async () => {
        setLoading(true);

        try {
            const response = await api.get(`/posts/${postId}/comments`);
            setComments(response.data.comments ?? []);
        } catch (err) {
            console.error('Erro ao carregar comentários:', err);
            setError(apiError(err, t('comment.load_error')));
        } finally {
            setLoading(false);
        }
    }, [postId, t]);

    // Carrega os comentários ao abrir e quando o post muda
    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // Envia um novo comentário e o coloca no topo da lista
    async function handleSubmit(event) {
        event.preventDefault();

        const content = comment.trim();
        if (!content || sending) return;

        // Comentar exige login
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        setSending(true);
        setError('');

        try {
            const response = await api.post(`/posts/${postId}/comments`, { content });

            setComments((previous) => [response.data.comment, ...previous]);
            setComment('');
        } catch (err) {
            console.error('Erro ao comentar:', err);
            setError(apiError(err, t('comment.send_error')));
        } finally {
            setSending(false);
        }
    }

    return (
        <section className="w-full mt-6">


            {/* Campo de comentário */}
            <div className="w-full px-4 mb-2">
                <div className="card w-full max-w-xl mx-auto bg-fundo flex flex-col items-center justify-center pb-4">

                    <h2 className="max-w-xl text-xl font-bold mb-1 ml-2 flex justify-left">
                        Comentários
                    </h2>

                    {/* Formulário de novo comentário */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex gap-3 items-start mt-4 w-full mx-4 flex-row justify-center max-w-xl"
                    >
                        <textarea
                            type="text"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder={t('comment.placeholder')}
                            rows={2}
                            maxLength={1000}
                            className="areaform align-center"
                        />

                        <button
                            type="submit"
                            className="btn bg-destaque text-fundo border-none rounded-full w-16"
                            disabled={!comment.trim() || sending}
                        >
                            {t('comment.send')}
                        </button>
                    </form>

                    {error && <p role="alert" className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            </div>

            {/* Separador entre comentários */}
            <div className="divider divider-vertical pt-4"></div>

            {/* Lista de comentários */}
            <div>
                {loading && <p className="text-cinza text-sm text-center">{t('profile.loading')}</p>}

                {comments.map((item) => (
                    <Comment
                        key={item.comment_id}
                        author={item.author?.user_id}
                        authorname={item.author?.name}
                        authorusername={item.author?.username}
                        authoravatar_url={item.author?.avatar_url}

                        comment_id={item.comment_id}
                        comment_content={item.comment_content}
                        createdAt={item.createdAt}

                        likesCount={item.likesCount}
                        likedByMe={item.likedByMe}
                    />
                ))}
            </div>


        </section>
    );
}
