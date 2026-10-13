//TELA DE MENSAGENS
import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';

import '@/components/form/forms.css';

export default function Comissions() {

    const { t } = useTranslation();
    const { pathname } = useLocation();
    const messagesEndRef = useRef(null);

    const currentUserId = 2;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'end', behavior: 'instant' });
    }, [pathname]);

    const dbComm = [
        {
            chat: 1,
            chat_send_id: 1,
            chat_receiver_id: 2,
            chat_message: 'Oi! Vi seu último post, ficou muito bom.',
            chat_data: '2026-10-12T18:40:00.000Z',
            created_at: '2026-10-12T18:40:00.000Z',
            sender: {
                user_id: 1,
                user_idname: 'rnaranrr',
                user_nickname: 'rnaranrr',
                user_pfpurl: 'https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg',
            },
            receiver: {
                user_id: 2,
                user_idname: 'usuario',
                user_nickname: 'Usuário',
                user_pfpurl: null,
            },
        },
        {
            chat: 2,
            chat_send_id: 2,
            chat_receiver_id: 1,
            chat_message: 'Obrigado! Que bom que você gostou.',
            chat_data: '2026-10-12T18:42:00.000Z',
            created_at: '2026-10-12T18:42:00.000Z',
            sender: {
                user_id: 2,
                user_idname: 'usuario',
                user_nickname: 'Usuário',
                user_pfpurl: null,
            },
            receiver: {
                user_id: 1,
                user_idname: 'rnaranrr',
                user_nickname: 'rnaranrr',
                user_pfpurl: 'https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg',
            },
        },
    ];
    const firstMessage = dbComm[0];
    const conversationContact = firstMessage
        ? firstMessage.chat_send_id === currentUserId
            ? firstMessage.receiver
            : firstMessage.sender
        : null;

    function handleSubmit(event) {
        event.preventDefault();
    }

    return (

        <main className="flex min-h-dvh w-full min-w-0 justify-center bg-fundo font-principal text-texto-main">
            <div className="flex min-h-dvh w-full min-w-0 max-w-3xl flex-col border-x border-discreto bg-fundo">
                <header className="sticky top-0 z-10 flex min-h-16 shrink-0 items-center justify-center border-b border-discreto bg-fundo px-4">
                    <p className="truncate text-base font-bold">
                        {conversationContact?.user_nickname ?? conversationContact?.user_idname}
                    </p>
                </header>

                <section className="flex min-h-0 flex-1 flex-col">
                    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-6 pb-24 md:pb-6">
                        {dbComm.map((message) => {
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
                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex shrink-0 items-center gap-3 border-t border-discreto bg-fundo px-4 py-3 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-4"
                    >
                        <input
                            type="text"
                            placeholder={t('comment.placeholder')}
                            aria-label={t('comment.placeholder')}
                            className="inputform min-w-0 flex-1"
                        />
                        <button
                            type="submit"
                            aria-label={t('comment.placeholder')}
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