//ARRUMAR PLACEHOLDERS DPS
import { useEffect, useRef } from 'react';

import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, X, ArrowUpRight } from 'lucide-react';

import '@/components/form/forms.css';

export default function Comissions() {

    const { t } = useTranslation();
    const { pathname } = useLocation();


    function handleSubmit(event) {
        event.preventDefault();
    }

    return (

        <main className="flex min-h-dvh w-full min-w-0 justify-center bg-fundo font-principal text-texto-main">
            <div className="flex min-h-dvh w-full min-w-0 max-w-3xl flex-col border-x border-discreto bg-fundo">

                <form
                    onSubmit={handleSubmit}
                    className="flex shrink-0 pt-8 items-center justify-center gap-3 border-t border-discreto bg-fundo px-4 py-3 pb-4"
                >
                    <input
                        type="text"
                        placeholder="Pesquise aqui"
                        className="inputform min-w-0 flex-1"
                    />
                    <button
                        type="submit"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full border-none bg-destaque font-bold text-fundo transition-opacity hover:opacity-85"
                    >
                        <Search />
                    </button>
                </form>

                <div className='text-sm text-cinza mt-2 px-4 flex flex-row gap-4 items-center w-full'>

                    <a><X /></a>
                    <p>Pesquisa recente</p>

                    <ArrowUpRight className='justify-self-right ml-auto'/>
                </div>

            </div>
        </main >
    );
}