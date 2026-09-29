import { NavLink } from 'react-router-dom';
import { House, Send, CirclePlus, Search, CircleUser, ShieldAlert, LogOut } from 'lucide-react';
import '@/components/Sidebar.css';
import { useTranslation } from 'react-i18next';
import Logo from '@/assets/logo/icon-logo-small.svg?react';

export default function Sidebar() {

    // Obtém o objeto de idioma do i18next para mudar o idioma atual
    const { i18n, t } = useTranslation();

    // Altera o idioma da aplicação ao clicar nos botões de idioma.
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <aside className='h-screen sticky top-0 z-50 hidden sm:flex flex-col justify-between w-64 border-r border-discreto bg-fundo p-4 min-h-screen font-principal'>
            <div>
                {/* Logo */}
                <div className='px-4 py-3 mb-6 mx-8 flex flex-row justify-around items-center'>
                    <Logo className='w-9 pt-3 text-texto-main' />
                    <h1 className='text-3xl font-logo text-texto-main h-fit pt-4'>AR.te</h1>
                </div>

                {/* Botões de troca de idioma */}
                <div className="flex gap-2 p-2 fixed top-0 right-0 z-[999]">
                    <button onClick={() => changeLanguage('pt')} className="btn btn-lang">PT</button>
                    <button onClick={() => changeLanguage('en')} className="btn btn-lang">EN</button>
                </div>

                {/* Lista de Navegação */}
                <nav className='flex flex-col gap-1'>

                    {/* 
                        className={({ isActive }) => isActive ? 'sidebar-link isActive' : 'sidebar-link'}
                        
                        Navlink recebe função na sua classe
                        a biblioteca react-router-com compara o endereço da página com o endereço do NavLink (to='')
                        isActive ? 'isActive' : '' funciona como if-else
                        se for igual, NavLink ganha as classe sidebar-link isActive, caso contrario, ganha somente sidebar-link
                    */}

                    {/* Feed Principal */}
                    <NavLink
                        to='/'
                        className={({ isActive }) => isActive ? 'sidebar-link isActive' : 'sidebar-link'}
                    >
                        <House />
                        <span>{t('sidebar.home')}</span>
                    </NavLink>

                    {/* DM */}
                    <NavLink
                        to='/chat'
                        className={({ isActive }) => isActive ? 'sidebar-link isActive' : 'sidebar-link'}
                    >
                        <Send />
                        <span>{t('sidebar.inbox')}</span>
                    </NavLink>

                    {/* Criar Post */}
                    <NavLink
                        to='/postar'
                        className={({ isActive }) => isActive ? 'sidebar-link isActive' : 'sidebar-link'}
                    >
                        <CirclePlus />
                        <span>{t('sidebar.post')}</span>
                    </NavLink>

                    {/* Pesquisar */}
                    <NavLink
                        to='/pesquisar'
                        className={({ isActive }) => isActive ? 'sidebar-link isActive' : 'sidebar-link'}
                    >
                        <Search />
                        <span>{t('sidebar.search')}</span>
                    </NavLink>

                    {/* Perfil */}
                    <NavLink
                        to='/perfil'
                        className={({ isActive }) => isActive ? 'sidebar-link isActive' : 'sidebar-link'}
                    >
                        <CircleUser />
                        <span>{t('sidebar.profile')}</span>
                    </NavLink>

                    {/* Moderação */}
                    <NavLink
                        to='/mod'
                        className={({ isActive }) => isActive ? 'sidebar-link isActive' : 'sidebar-link'}
                    >
                        <ShieldAlert />
                        <span>{t('sidebar.moderation')}</span>
                    </NavLink>
                </nav>

                {/* INSERIR AQUI DETALHES DO PERFIL*/}

                {/* Botão de Sair no Rodapé */}
                <div className='mt-4 pt-4 border-t border-discreto'>
                    <button className='sidebar-link w-full text-left text-cinza'>
                        <LogOut size={20} />
                        <span>{t('sidebar.logout')}</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}