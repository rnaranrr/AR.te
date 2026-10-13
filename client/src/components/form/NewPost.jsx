import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { ArrowLeft } from 'lucide-react';

import PostForm from '@/components/form/PostForm';
import RaffleForm from '@/components/form/RaffleForm';

export default function NewPost() {

    const { t } = useTranslation();
    const location = useLocation();

    //define aba de midia e comissão com base no final de url
    const isRaffle = location.pathname.startsWith('/raffle');

    return (
        <aside className="flex justify-center items-start min-h-dvh bg-fundo w-full font-principal">
            <div className="card w-full max-w-md bg-fundo flex flex-col items-center">

                {/* navbar*/}
                <div className='navbar font-principal sticky top-0 bg-fundo align-center mb-4 flex flex-col z-999'>
                    <p className='my-4 font-bold text-lg'>{t('newpost.title')}</p>
                    <div className="join h-9 md:h-fit mb-2">
                        <NavLink
                            to='/post/new'
                            end
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('newpost.post')}
                        </NavLink>

                        <div className="divider divider-horizontal"></div>

                        <NavLink
                            to='/raffle/new'
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('newpost.raffle')}
                        </NavLink>
                    </div>
                </div>

                <div className="w-full mt-6">
                    {/* Renderiza o conteúdo do feed com base na rota atual */}
                    {isRaffle ? <RaffleForm /> : <PostForm /> }
                </div>
            </div>
        </aside >
    );
}