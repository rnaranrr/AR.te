
import { useEffect, useRef } from 'react';

import { useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import '@/components/form/forms.css';

export default function ModBar({
    moderator_idname,
    moderator_nickname,
    moderator_userprofile
}) {

    const { t } = useTranslation();
    const { pathname } = useLocation();

    const dbMod = [
        {
            moderator_nickname: 'Matheus Ramón de Carvalho',
            moderator_idname: 'rnaranrr',
            moderator_userprofile: 'rnaranrr'
        }
    ]

    function handleSubmit(event) {
        event.preventDefault();
    }

    return (

        <div className='navbar h-fit font-principal sticky top-0 z-50 bg-fundo flex items-center justify-between border-b border-discreto'>

            <div className='text-destaque px-2 py-1 ml-8 border-2 border-destaque rounded-full'>{t('mod.label')}</div>

            <div className='mr-8 text-right'>
                {/* Menu de opções do mod */}
                {dbMod.map((mod) => (

                    < div key={mod.moderator_idname} className="dropdown dropdown-end " >
                        <div tabIndex={0} role="button" className="btn border-none bg-fundo px-0 flex flex-col">
                            <p className='md:text-lg'>{mod.moderator_nickname}</p>
                            <p className='text-cinza'> @ {mod.moderator_userprofile}</p>
                        </div>
                        <ul tabIndex={-1} className="dropdown-content menu bg-cinza rounded-box z-1 w-60 p-2 shadow-sm text-[#f1f1e7]">
                            <li>
                                <NavLink to='/mod/create'>{t('mod.create')}</NavLink>
                            </li>
                            <li>
                                <NavLink to='/mod/logout'>{t('sidebar.logout')}</NavLink>
                            </li>
                        </ul>
                    </div>
                ))}
            </div>
        </div >
    );
}
