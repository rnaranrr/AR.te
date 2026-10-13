//TELA DE MENSAGENS
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ListElement({
    sender,
    sendername,
    senderusername,
    senderavatar_url,

    chat_id,
    chat_content,
    chat_data,

    likesCount
}) {
    const location = useLocation();

    const senderProfilePath = `/chat/${encodeURIComponent(senderusername)}`;

    // Obtém o objeto de idioma do i18next para definir o idioma atual
    const { t, i18n } = useTranslation();

    // Formata a data de criação do post de acordo com o idioma atual
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
            <img className="size-16 shrink-0 rounded-full" src={senderavatar_url}/>
            <div className='flex min-w-0 flex-col'>
                <p className='truncate font-bold'>{sendername}</p>
                <p className='truncate text-cinza'>@{senderusername}</p>
            </div>
            <div className='ml-auto flex min-w-0 flex-1 flex-col justify-self-end text-end text-cinza'>
                <p className='truncate font-semibold'>{chat_content}</p>
                <p>{formattedCreatedAt}</p>
            </div>
        </NavLink>
    );
}