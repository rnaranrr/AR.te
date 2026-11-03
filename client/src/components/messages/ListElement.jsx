// Componente: linha de lista de usuários (conversas com a última mensagem; seguidores e seguindo sem ela)
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CircleUser } from 'lucide-react';

import { assetUrl } from '@/services/api';

// Linha de lista: mostra o usuário (foto, nome e @username) e, nas conversas, a última mensagem
// to = destino do clique (padrão: a conversa com o usuário); sem chat_content a coluna da mensagem não aparece
export default function ListElement({
    to,
    sendername,
    senderusername,
    senderavatar_url,

    chat_content,
    chat_data
}) {
    const senderProfilePath = to ?? `/chat/${encodeURIComponent(senderusername)}`;

    // Idioma atual (define o formato da data)
    const { i18n } = useTranslation();

    // Formata a data da última mensagem de acordo com o idioma atual
    const dateLocale = i18n.language?.toLowerCase().startsWith('pt')
        ? 'pt-BR'
        : 'en-US';
    const formattedCreatedAt = chat_data
        ? new Intl.DateTimeFormat(dateLocale, {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(chat_data))
        : '';
    return (

        <NavLink
        to={senderProfilePath}
        className="bg-fundo hover:bg-discreto text-texto-main flex flex-row px-4 my-2 py-4 gap-8 border-b border-discreto rounded-none transition-colors duration-200 ease-in-out">
            {senderavatar_url ? (
                <img className="size-16 shrink-0 rounded-full object-cover" src={assetUrl(senderavatar_url)}/>
            ) : (
                <CircleUser className="size-16 shrink-0 rounded-full stroke-1" />
            )}
            <div className='flex min-w-0 flex-col'>
                <p className='truncate font-bold'>{sendername}</p>
                <p className='truncate text-cinza'>@{senderusername}</p>
            </div>
            {/* Última mensagem e data (somente nas conversas) */}
            {chat_content !== undefined && (
                <div className='ml-auto flex min-w-0 flex-1 flex-col justify-self-end text-end text-cinza'>
                    <p className='truncate font-semibold'>{chat_content}</p>
                    <p>{formattedCreatedAt}</p>
                </div>
            )}
        </NavLink>
    );
}
