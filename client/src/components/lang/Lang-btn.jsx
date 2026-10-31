// Componente: botões para trocar o idioma (PT / EN)
import '@/components/lang/lang-btn.css';

import { useTranslation } from 'react-i18next';


// Exibe os botões de idioma e salva a escolha no navegador
export default function LangBtn() {
    // Objeto do i18next, usado para trocar o idioma
    const { i18n } = useTranslation();

    // Altera o idioma da aplicação ao clicar nos botões de idioma
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
