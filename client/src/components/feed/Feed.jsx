// Componente: feed de posts com as abas "Para você" e "Seguindo"
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import '@/components/feed/Feed.css';

import FeedForyou from '@/components/feed/FeedForyou';
import FeedFollowing from '@/components/feed/FeedFollowing';

// Mostra a aba escolhida de acordo com a rota atual
export default function Feed() {
    const { t } = useTranslation();
    // Caminho atual da URL
    const location = useLocation();

    // A aba "Seguindo" está ativa quando a rota começa com /following
    const isFollowing = location.pathname.startsWith('/following');

    return (
        <aside className="w-full">
            {/* Abas para alternar entre "Para você" e "Seguindo" */}
            <div className="md:pt-9 h-9 md:h-fit font-principal bg-fundo border-b border-discreto w-full flex justify-center items-center px-4 py-2 sticky top-16 z-10 md:top-0">
                <div className="join h-9 md:h-fit mb-2">

                        {/* Aba "Para você" */}
                        <NavLink
                            to='/feed'
                            className={({ isActive }) => isActive ? 'isActive feed' : 'feed'}
                        >
                            {t('feed.foryou')}
                        </NavLink>


                    <div className="divider divider-horizontal"></div>


                        {/* Aba "Seguindo" */}
                        <NavLink
                            to='/following'
                            className={({ isActive }) => isActive ? 'isActive feed' : 'feed'}
                        >
                            {t('feed.following')}
                        </NavLink>

                </div>
            </div>

            {/* Renderiza o conteúdo do feed com base na rota atual */}
            {isFollowing ? <FeedFollowing /> : <FeedForyou />}
        </aside>
    );
}
