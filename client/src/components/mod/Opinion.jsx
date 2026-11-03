// Componente: uma opinião da comunidade sobre um post em moderação (autor, texto, data e botão de remover)
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleUser, Trash2 } from 'lucide-react';

import { assetUrl } from '@/services/api';

// Mostra a opinião; o botão de remover só aparece para o autor dela (mine)
export default function Opinion({
    authorname,
    authorusername,
    authoravatar_url,

    opinion_content,
    createdAt,

    mine = false,
    onRemove
}) {
    // Função de tradução e idioma atual (define o formato da data)
    const { t, i18n } = useTranslation();

    // Formata a data da opinião de acordo com o idioma atual
    const dateLocale = i18n.language?.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en-US';
    const formattedCreatedAt = createdAt
        ? new Intl.DateTimeFormat(dateLocale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(createdAt))
        : '';

    return (
        <aside className="w-full flex flex-col justify-center items-center mx-auto top-0">
            {/* Card da opinião */}
            <div className="card bg-fundo w-full max-w-2xl min-w-90 rounded-none">
                <div className="card-body w-full min-w-90">

                    {/* Cabeçalho da opinião */}
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

                            {/* Texto da opinião */}
                            <p className="pt-2 break-words">
                                {opinion_content}
                            </p>

                            {/* Ações da opinião */}
                            <div className="flex w-full items-center justify-between gap-4 mt-3">

                                {/* Botão de remover (somente o autor) */}
                                {mine ? (
                                    <button
                                        type="button"
                                        onClick={onRemove}
                                        className="flex items-center gap-1 text-sm text-cinza hover:cursor-pointer hover:text-destaque"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>{t('mod.opinion_remove')}</span>
                                    </button>
                                ) : (
                                    <span />
                                )}

                                {/* Data de criação */}
                                <p className="text-sm text-cinza flex flex-row items-center justify-end ml-auto">
                                    {formattedCreatedAt}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Separador entre opiniões */}
            <div className="divider divider-vertical"></div>
        </aside>
    );
}
