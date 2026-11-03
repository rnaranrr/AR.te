// Componente: um comentário (autor, texto, data e curtida)
import { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, CircleUser } from 'lucide-react';

import api, { assetUrl, isLoggedIn } from '@/services/api';

// Componente Comment recebe os dados do comentário e de seu autor

export default function Comment({
    authorname,
    authorusername,
    authoravatar_url,

    comment_id,
    comment_content,

    createdAt,
    likesCount,
    likedByMe = false,
}) {
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Estado de like e contador (valores iniciais vindos do servidor)
    const [liked, setLiked] = useState(Boolean(likedByMe));
    const [displayedLikes, setDisplayedLikes] = useState(Number(likesCount) || 0);

    // Impede cliques repetidos enquanto a requisição está em andamento
    const pendingRef = useRef(false);

    // Função responsável pelo like: atualiza a tela na hora, confirma com o servidor e desfaz se falhar
    async function Like() {
        // Curtir exige login
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        if (pendingRef.current) return;
        pendingRef.current = true;

        const wasLiked = liked;
        setLiked(!wasLiked);
        setDisplayedLikes((current) => Math.max(0, current + (wasLiked ? -1 : 1)));

        try {
            const response = await api.post(`/posts/comments/${comment_id}/like`);

            setLiked(response.data.liked);
            setDisplayedLikes(response.data.likesCount);
        } catch (err) {
            console.error('Erro ao curtir comentário:', err);

            setLiked(wasLiked);
            setDisplayedLikes((current) => Math.max(0, current + (wasLiked ? 1 : -1)));
        } finally {
            pendingRef.current = false;
        }
    }

    // Obtém o idioma atual
    const { i18n } = useTranslation();

    // Define o idioma para a formatação da data
    const dateLocale = i18n.language?.toLowerCase().startsWith('pt')
        ? 'pt-BR'
        : 'en-US';

    // Formata a data de criação do comentário
    const formattedCreatedAt = createdAt
        ? new Intl.DateTimeFormat(dateLocale, {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(createdAt))
        : '';

    return (
        <aside className="w-full flex flex-col justify-center items-center mx-auto top-0">
            {/* Card do comentário */}
            <div className="card bg-fundo w-full max-w-2xl min-w-90 rounded-none">
                <div className="card-body w-full min-w-90">

                    {/* Cabeçalho do comentário */}
                    <div className="flex items-start gap-3">

                        {/* Foto do autor */}
                        <NavLink to={`/user/${authorusername}`}>
                            {authoravatar_url ? (
                                <img
                                    src={assetUrl(authoravatar_url)}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <CircleUser className="w-10 h-10 rounded-full bg-fundo text-texto-main stroke-1" />
                            )}
                        </NavLink>

                        {/* Informações do autor e conteúdo */}
                        <div className="flex-1 min-w-0">

                            {/* Nome e username */}
                            <NavLink
                                to={`/user/${authorusername}`}
                                className="flex flex-row flex-wrap gap-1 items-center"
                            >
                                <h3 className="font-bold">{authorname}</h3>
                                <p className="text-sm text-cinza">
                                    @{authorusername}
                                </p>
                            </NavLink>

                            {/* Conteúdo do comentário */}
                            <p className="pt-2">
                                {comment_content}
                            </p>

                            {/* Ações do comentário */}
                            <div className="flex w-full items-center justify-between gap-4 mt-3">

                                {/* Botão de like */}
                                <button
                                    onClick={Like}
                                    className="flex items-center gap-1 hover:cursor-pointer"
                                >
                                    <Heart
                                        className={`interaction ${liked ? 'interactedlike' : ''
                                            }`}
                                    />
                                    <span>{displayedLikes}</span>
                                </button>

                                {/* Data de criação */}
                                <p className="text-sm text-cinza flex flex-row items-center justify-end ml-auto">
                                    {formattedCreatedAt}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Separador entre comentários */}
            <div className="divider divider-vertical"></div>
        </aside>
    );

}
