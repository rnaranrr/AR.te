import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Comissions() {

    const { t } = useTranslation();
    const location = useLocation();

    return (

        <aside className="w-full min-h-dvh bg-fundo text-texto-main">
            c
        </aside>
    );
}