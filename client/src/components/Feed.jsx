import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import '@/components/Feed.css';

import FeedForyou from '@/components/FeedForyou';
import FeedFollowing from '@/components/FeedFollowing';

export default function Feed() {
    const { t } = useTranslation();
    const location = useLocation();

    const isFollowing = location.pathname.startsWith('/following');

    return (
        <aside className="w-full">
            {/* Aba seletora de foryou */}
            <div className="sm:pt-9 h-9 sm:h-fit font-principal bg-fundo border-b border-discreto w-full flex justify-center items-center px-4 py-2 sticky top-16 z-10 sm:top-0">
                <div className="join h-9 sm:h-fit mb-2">

                        <NavLink
                            to='/feed'
                            className={({ isActive }) => isActive ? 'isActive feed' : 'feed'}
                        >
                            {t('feed.foryou')}
                        </NavLink>


                    <div className="divider divider-horizontal"></div>


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