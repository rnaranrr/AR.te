import '@/components/lang/lang-btn.css';

import { useTranslation } from 'react-i18next';


export default function Navbar() {
    // Obtém o objeto de idioma do i18next para mudar o idioma atual
    const { i18n } = useTranslation();

    // Altera o idioma da aplicação ao clicar nos botões de idioma.
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('idiomaSalvo', lng);
    };

    return (
        <div className="flex gap-1 p-2 pt-5 fixed top-0 right-0 z-[999]">
            {/* Botões de troca de idioma */}
            <button onClick={() => changeLanguage('pt')} className="btn btn-lang">PT</button>
            <button onClick={() => changeLanguage('en')} className="btn btn-lang">EN</button>
        </div>
    );
}