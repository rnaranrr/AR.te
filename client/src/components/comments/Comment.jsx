import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

// Componente Comment recebe os dados do comentário e de seu autor

export default function Comment({
    author,
    authorname,
    authorusername,
    authoravatar_url,

    comment_content,

    createdAt,
    likesCount,
}) {
    // Controla o estado de like do comentário
    const [liked, setLiked] = useState(false);

    // Calcula o número de likes exibido
    const displayedLikes = (Number(likesCount) || 0) + (liked ? 1 : 0);

    // Função responsável pelo like
    function Like() {
        // IMPLEMENTAR A LÓGICA DE LIKE DEPOIS
        setLiked((currentLiked) => !currentLiked);
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
                        <NavLink to={`/user/${author}`}>
                            <img
                                src={authoravatar_url}
                                alt={`Foto de ${authorname}`}
                                className="w-10 h-10 rounded-full"
                            />
                        </NavLink>

                        {/* Informações do autor e conteúdo */}
                        <div className="flex-1 min-w-0">

                            {/* Nome e username */}
                            <NavLink
                                to={`/user/${author}`}
                                className="flex flex-row flex-wrap gap-1 items-center"
                            >
                                <h3 className="font-bold">{authorname}</h3>
                                <p className="text-sm text-cinza">
                                    {authorusername}
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
