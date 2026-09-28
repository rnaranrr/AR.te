import { NavLink } from 'react-router-dom';
import { House, Send, CirclePlus, Search, CircleUser } from 'lucide-react';
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

            {/* Criar Post */}
            <NavLink
                to='/postar'
                className={({ isActive }) => isActive ? 'isActive' : ''}
            >
                <CirclePlus />
            </NavLink>

            {/* Pesquisar */}
            <NavLink
                to='/pesquisar'
                className={({ isActive }) => isActive ? 'isActive' : ''}
            >
                <Search />
            </NavLink>

            {/* Perfil */}
            <NavLink
                to='/perfil'
                className={({ isActive }) => isActive ? 'isActive' : ''}
            >
                <CircleUser />
            </NavLink>
        </div>
    );
}