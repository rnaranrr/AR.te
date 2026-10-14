//FAZENDO

import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import ListElement from '@/components/messages/ListElement';

export default function Comissions() {

    const { t } = useTranslation();
    const location = useLocation();

    const [Dm, setDm] = useState('');

    // Mock temporário
    const dbComm = [
        {
            chat: 1,
            chat_message: "Obrigado! Que bom que você gostou.",
            chat_data: "2026-09-30T18:45:00.000Z",

            // Dm.belongsTo(User, { as: 'author' })
            sender: {
                user_id: 1,
                name: "rnaranrr",
                username: "rnaranrr",
                avatar_url: "https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg"
            },

            likesCount: 999,
        },
    ]

    return (

        <aside className="flex justify-center items-start min-h-dvh bg-fundo w-full font-principal">
            <div className="w-full h-full bg-fundo flex flex-col items-center">

                {/* navbar*/}
                <div className='navbar font-principal sticky top-0 bg-fundo align-center mb-4 flex flex-col z-999 border-b-1 border-discreto'>
                    <p className='my-4 font-bold text-lg'>{t('messages.title')}</p>
                </div>

                <div className='card md:border-1 border-discreto h-full md:max-w-xl w-full mb-4'>
                    {dbComm.map((dm) => (
                        <ListElement
                            key={dm.chat}
                            sender={dm.sender.user_id}
                            sendername={dm.sender.name}
                            senderusername={dm.sender.username}
                            senderavatar_url={dm.sender.avatar_url}

                            chat_id={dm.chat}
                            chat_content={dm.chat_message}
                            chat_data={dm.chat_data}

                            likesCount={dm.likesCount}
                        />
                    ))}

                    <p className='text-sm text-cinza text-center w-full'>{t('messages.new')}</p>
                </div>
            </div>
        </aside >
    );
}