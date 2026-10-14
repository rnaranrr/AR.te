//TELA DE MENSAGENS
import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';

import '@/components/form/forms.css';

export default function Comissions() {

    const { t } = useTranslation();
    const { pathname } = useLocation();


    function handleSubmit(event) {
        event.preventDefault();
    }

    return (

        <aside className="flex min-h-dvh w-full min-w-0 justify-center bg-fundo font-principal text-texto-main">

        </aside>
    );
}