import Logo from '@/assets/logo/icon-logo-small.svg?react';
import '@/components/langbtn.css';
import { useTranslation } from 'react-i18next';

// Logo no topo do site para telas pequenas
export default function Navbar() {


    // Obtém o objeto de idioma do i18next para mudar o idioma atual
    const { i18n } = useTranslation();

    // Altera o idioma da aplicação ao clicar nos botões de idioma.
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="navbar sm:hidden font-principal sticky top-0 z-50 bg-fundo">

            {/* Botões de troca de idioma */}
            <div className="flex gap-2 p-2 fixed top-0 right-0">
                <button onClick={() => changeLanguage('pt')} className="btn btn-lang">PT</button>
                <button onClick={() => changeLanguage('en')} className="btn btn-lang">EN</button>
            </div>

            <div className='flex w-[100%] justify-center flex-row justify-around items-center'>
                <Logo className='w-9 pt-3 text-texto-main' />
                <h1 className='text-3xl font-logo text-texto-main h-fit pt-4'>AR.te</h1>
            </div>

        </div>
    );
}