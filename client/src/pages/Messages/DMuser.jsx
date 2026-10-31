// Página: conversa de mensagens diretas com um usuário
import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';

import api, { apiError, getStoredUser, isLoggedIn } from '@/services/api';

import '@/components/form/forms.css';

// Intervalo (ms) para buscar novas mensagens enquanto a conversa está aberta
const POLL_INTERVAL = 5000;

// Mostra o histórico, busca novas mensagens a cada 5 segundos e envia mensagens
export default function DMuser() {

    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Username do contato vem da rota /chat/:username
    const { username } = useParams();

    // Marcador no fim da conversa, usado para rolar até a última mensagem
    const messagesEndRef = useRef(null);

    // Id do usuário logado (salvo no login)
    const currentUserId = getStoredUser()?.id;

    // Dados da conversa
    const [contact, setContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // Busca o histórico da conversa
    const loadMessages = useCallback(async () => {
        try {
            const response = await api.get(`/chat/${encodeURIComponent(username)}`);

            setContact(response.data.contact);
            setMessages(response.data.messages ?? []);
        } catch (err) {
            console.error('Erro ao carregar mensagens:', err);
            setError(apiError(err, t('messages.load_error')));
        }
    }, [username, t]);

    // Carrega ao abrir e atualiza periodicamente (sem websockets, uma busca simples a cada poucos segundos)
    useEffect(() => {
        // Mensagens diretas exigem login
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        loadMessages();

        const interval = setInterval(loadMessages, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [loadMessages, navigate]);

    // Rola para a última mensagem quando chegam novas
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'instant' });
    }, [messages.length]);

    // Envia uma nova mensagem
    async function handleSubmit(event) {
        event.preventDefault();

        const message = text.trim();
        if (!message || sending) return;

        setSending(true);
        setError('');

        try {
            const response = await api.post(`/chat/${encodeURIComponent(username)}`, { message });

            setMessages((previous) => [...previous, response.data.message]);
            setText('');
        } catch (err) {
            console.error('Erro ao enviar mensagem:', err);
            setError(apiError(err, t('messages.send_error')));
        } finally {
            setSending(false);
        }
    }

    return (

        <main className="flex min-h-dvh w-full min-w-0 justify-center bg-fundo font-principal text-texto-main">
            <div className="flex min-h-dvh w-full min-w-0 max-w-3xl flex-col border-x border-discreto bg-fundo">
                {/* Barra superior com o contato */}
                <header className="sticky top-0 z-10 flex min-h-16 shrink-0 items-center justify-center border-b border-discreto bg-fundo px-4">
                    <p className="truncate text-base font-bold">
                        {contact?.name ?? contact?.username ?? username}
                    </p>
                </header>

                {/* Mensagens da conversa */}
                <section className="flex min-h-0 flex-1 flex-col">
                    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-6 pb-24 md:pb-6">
                        {messages.map((message) => {
                            const isCurrentUser = message.chat_send_id === currentUserId;

                            return (
                                <div
                                    key={message.chat}
                                    className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${isCurrentUser ? 'rounded-br-sm bg-destaque text-[#f1f1e7]' : 'rounded-bl-sm bg-discreto text-texto-main'}`}>
                                        {message.chat_message}
                                    </div>
                                </div>
                            );
                        })}
                        {error && <p role="alert" className="text-center text-sm text-red-500">{error}</p>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Campo para escrever e enviar a mensagem */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex shrink-0 items-center gap-3 border-t border-discreto bg-fundo px-4 py-3 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-4"
                    >
                        <input
                            type="text"
                            value={text}
                            onChange={(event) => setText(event.target.value)}
                            maxLength={2000}
                            className="inputform min-w-0 flex-1"
                        />
                        <button
                            type="submit"
                            disabled={sending || !text.trim()}
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-destaque font-bold text-fundo transition-opacity hover:opacity-85"
                        >
                            <ArrowUp />
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
