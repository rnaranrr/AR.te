// Página: criação de post ou de raffle, com abas para alternar
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import PostForm from '@/components/form/PostForm';
import RaffleForm from '@/components/form/RaffleForm';

// Mostra o formulário de post ou o de raffle conforme a rota
export default function NewPost() {

    const { t } = useTranslation();
    // Caminho atual da URL
    const location = useLocation();

    // A aba "Raffle" fica ativa quando a rota começa com /raffle; senão, "Post"
    const isRaffle = location.pathname.startsWith('/raffle');

    return (
        <aside className="flex justify-center items-start min-h-dvh bg-fundo w-full font-principal">
            <div className="w-full bg-fundo flex flex-col items-center">

                {/* Barra superior com título e abas */}
                <div className='navbar font-principal sticky top-0 bg-fundo align-center mb-4 flex flex-col z-999 border-b-1 border-discreto'>
                    <p className='my-4 font-bold text-lg'>{t('newpost.title')}</p>
                    <div className="join h-9 md:h-fit mb-2">
                        {/* Aba de post */}
                        <NavLink
                            to='/post/new'
                            end
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('newpost.post')}
                        </NavLink>

                        <div className="divider divider-horizontal"></div>

                        {/* Aba de raffle */}
                        <NavLink
                            to='/raffle/new'
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('newpost.raffle')}
                        </NavLink>
                    </div>
                </div>

                <div className="w-full mt-6">
                    {/* Formulário da aba ativa */}
                    {isRaffle ? <RaffleForm /> : <PostForm /> }
                </div>
            </div>
        </aside >
    );
}
