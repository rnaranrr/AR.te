import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DMList from '@/pages/Messages/DMList';
import DMuser from '@/pages/Messages/DMuser';

export default function Comissions() {

    const { t } = useTranslation();
    const location = useLocation();

    const isOpen = location.pathname.endsWith('/media');

    return (

        <aside className="w-full min-h-dvh bg-fundo text-texto-main">
            {isOpen ? (<DMList />) : (<DMuser />)}
        </aside>
    );
}