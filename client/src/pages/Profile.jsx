import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Details from '@/pages/ProfileDetails';
import Timeline from '@/pages/Profile/Timeline';
import Media from '@/pages/Profile/Media';
import Comissions from '@/pages/Profile/Comissions';

export default function Profile() {

    const { t } = useTranslation();
    const location = useLocation();

    const isMedia = location.pathname.startsWith('/profile/media');
    const isComissions = location.pathname.startsWith('/profile/comissions');

    return (
        
        <aside className="w-full min-h-dvh bg-fundo text-texto-main">
            {/* Detalhes do perfil */}
            <Details />

            {/* Aba seletora de exibição */}
            <div className="h-fit font-principal bg-fundo border-b border-discreto w-full flex justify-center items-center px-4 py-2">

                <div className="join h-9 md:h-fit mb-2">

                        <NavLink
                            to='/profile'
                            end
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('profile.timeline')}
                        </NavLink>


                    <div className="divider divider-horizontal"></div>


                        <NavLink
                            to='/profile/media'
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('profile.media')}
                        </NavLink>

                    <div className="divider divider-horizontal"></div>


                        <NavLink
                            to='/profile/comissions'
                            className={({ isActive }) => isActive ? 'isActive profile' : 'profile'}
                        >
                            {t('profile.comissions')}
                        </NavLink>

                </div>
            </div>

            {/* Renderiza o conteúdo do feed com base na rota atual */}
            {isMedia ? <Media /> : isComissions ? <Comissions /> : <Timeline />}
        </aside>
    );
}