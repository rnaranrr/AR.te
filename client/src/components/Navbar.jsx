import { NavLink } from 'react-router-dom';

import { CirclePlus } from 'lucide-react';
import Logo from '@/assets/logo/icon-logo-small.svg?react';

import '@/components/langbtn.css';
import '@/components/Sidebar.css';

import LangBtn from '@/components/Lang-btn';

// Logo no topo do site para telas pequenas
export default function Navbar() {

    return (
        <div className='navbar sm:hidden font-principal sticky top-0 z-50 bg-fundo'>

            {/* Botão para a plat. de moderação */}
            <div className='flex gap-2 p-2 pt-5 fixed top-0 left-0 z-[999]'>
                <NavLink
                    to='/post/new'
                    className={({ isActive }) => isActive ? 'btn btn-lang isActive w-[50px]' : 'btn btn-lang w-[50px]'}
                >
                    <CirclePlus />
                </NavLink>
            </div>

            <LangBtn />

            {/* Logo do site */}

            <div className='mr-1 flex w-[100%] justify-center flex-row items-center'>
                <Logo className='w-9 pt-3 text-texto-main' />
                <h1 className='text-3xl font-logo text-texto-main h-fit pt-4'>AR.te</h1>
            </div>

        </div>
    );
}