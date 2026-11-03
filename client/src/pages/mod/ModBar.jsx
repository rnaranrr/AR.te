// Componente: barra superior do espaço de moderação (rótulo e menu do moderador)
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { clearModeratorSession, getStoredModerator } from '@/services/api';

import '@/components/form/forms.css';

// Exibe o menu do moderador logado ou, para os demais, o botão de entrar como moderador
export default function ModBar() {
    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Moderador logado (salvo no login de moderador) ou null
    const moderator = getStoredModerator();

    // Encerra somente a sessão de moderador (a sessão de usuário continua)
    function handleLogout() {
        clearModeratorSession();
        navigate('/mod/login');
    }

    return (

        <div className='navbar h-fit font-principal sticky top-0 z-50 bg-fundo flex items-center justify-between border-b border-discreto'>

            {/* Rótulo do espaço de moderação */}
            <div className='text-destaque px-2 py-1 ml-8 border-2 border-destaque rounded-full'>{t('mod.label')}</div>

            <div className='mr-8 text-right'>
                {/* Moderador logado: menu de opções. Demais usuários: botão para entrar como moderador */}
                {moderator ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn border-none bg-fundo px-0 flex flex-col">
                            <p className='md:text-lg'>{moderator.nickname}</p>
                            {moderator.userprofile && <p className='text-cinza'> @ {moderator.userprofile}</p>}
                        </div>
                        <ul tabIndex={-1} className="dropdown-content menu bg-cinza rounded-box z-1 w-60 p-2 shadow-sm text-[#f1f1e7]">
                            <li>
                                <NavLink to='/mod/create'>{t('mod.create')}</NavLink>
                            </li>
                            <li>
                                <button type="button" onClick={handleLogout}>{t('sidebar.logout')}</button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <NavLink
                        to='/mod/login'
                        className='btn bg-fundo text-destaque border-2 border-destaque rounded-full'
                    >
                        {t('mod.login')}
                    </NavLink>
                )}
            </div>
        </div >
    );
}
