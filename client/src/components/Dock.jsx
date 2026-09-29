import { NavLink } from 'react-router-dom';
import { House, Send, ShieldAlert, Search, CircleUser } from 'lucide-react';
import '@/components/Dock.css';

// Dock para telas pequenas
export default function Dock() {
    return (
        <div className='dock bg-fundo border-t border-discreto font-principal sm:hidden'>

            {/* 
                className={({ isActive }) => isActive ? 'isActive' : ''}
                
                Navlink recebe função na sua classe
                a biblioteca react-router-com compara o endereço da página com o endereço do NavLink (to='')
                isActive ? 'isActive' : '' funciona como if-else
                se for igual, NavLink ganha a classe isActive, caso contrario, não ganha nada
            */}

            {/* Feed Principal */}
            <NavLink
                to='/'
                className={({ isActive }) => isActive ? 'isActive' : ''}
            >
                <House />
            </NavLink>

            {/* DM */}
            <NavLink
                to='/chat'
                className={({ isActive }) => isActive ? 'isActive' : ''}
            >
                <Send />
            </NavLink>

            {/* Pesquisar */}
            <NavLink
                to='/search'
                className={({ isActive }) => isActive ? 'isActive' : ''}
            >
                <Search />
            </NavLink>

            {/* Criar Post */}
            <NavLink
                to='/mod'
                className={({ isActive }) => isActive ? 'isActive' : ''}
            >
                <ShieldAlert />
            </NavLink>

            {/* Perfil */}
            <NavLink
                to='/profile'
                className={({ isActive }) => isActive ? 'isActive' : ''}
            >
                <CircleUser />
            </NavLink>
        </div>
    );
}