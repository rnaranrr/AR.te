// Página: lista de conversas de mensagens diretas
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError, isLoggedIn } from '@/services/api';
import ListElement from '@/components/messages/ListElement';

// Lista de conversas do usuário logado (uma por contato, com a última mensagem)
export default function DMList() {

    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Conversas carregadas da API e estado da requisição
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Carrega as conversas da API
    useEffect(() => {
        // Mensagens diretas exigem login
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        let isMounted = true;

        async function loadConversations() {
            try {
                const response = await api.get('/chat');
                if (isMounted) setConversations(response.data.conversations ?? []);
            } catch (err) {
                console.error('Erro ao carregar conversas:', err);
                if (isMounted) setError(apiError(err, t('messages.load_error')));
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadConversations();
        return () => {
            isMounted = false;
        };
    }, [t, navigate]);

    return (

        <aside className="flex justify-center items-start min-h-dvh bg-fundo w-full font-principal">
            <div className="w-full h-full bg-fundo flex flex-col items-center">

                {/* Barra superior com o título */}
                <div className='navbar font-principal sticky top-0 bg-fundo align-center mb-4 flex flex-col z-999 border-b-1 border-discreto'>
                    <p className='my-4 font-bold text-lg'>{t('messages.title')}</p>
                </div>

                <div className='card md:border-1 border-discreto h-full md:max-w-xl w-full mb-4'>
                    {loading && <p className='text-sm text-cinza text-center w-full py-4'>{t('profile.loading')}</p>}
                    {error && <p className='text-sm text-red-500 text-center w-full py-4'>{error}</p>}

                    {conversations.map((dm) => (
                        <ListElement
                            key={dm.contact.user_id}
                            sender={dm.contact.user_id}
                            sendername={dm.contact.name}
                            senderusername={dm.contact.username}
                            senderavatar_url={dm.contact.avatar_url}

                            chat_id={dm.chat}
                            chat_content={dm.chat_message}
                            chat_data={dm.chat_data}
                        />
                    ))}

                    <p className='text-sm text-cinza text-center w-full'>{t('messages.new')}</p>
                </div>
            </div>
        </aside >
    );
}
