//FAZENDO

import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Comissions() {

    const { t } = useTranslation();
    const location = useLocation();

    return (

        <aside className="flex justify-center items-start min-h-dvh bg-fundo w-full font-principal">
            <div className="w-full h-full bg-fundo flex flex-col items-center">

                {/* navbar*/}
                <div className='navbar font-principal sticky top-0 bg-fundo align-center mb-4 flex flex-col z-999 border-b-1 border-discreto'>
                    <p className='my-4 font-bold text-lg'>{t('newpost.title')}</p>
                </div>

                <div className='card bg-destaque h-full w-xl'>
a                   
                </div>
            </div>
        </aside >
    );
}