import React from 'react';
import Dock from './components/Dock';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

export default function App() {
    return (
        <div className='flex flex-col sm:flex-row min-h-screen bg-fundo'>

            {/* Nome do site fixo no topo da tela para celular*/}
            <Navbar />

            {/* Sidebar para desktop */}
            <Sidebar />

            {/* Conteúdo */}
            <main className='flex-1 p-8 pb-24 sm:pb-8'>
                <h2 className='text-xl font-bold text-texto-main'>Conteúdo Principal</h2>
                <p className='text-cinza mt-2'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Possimus qui quia odio recusandae a nulla eum omnis magnam excepturi ab voluptatibus ut accusamus, unde ea cupiditate blanditiis, adipisci aspernatur consectetur?</p>

                <div className='h-[300vw]'>

                </div>

            </main>

            {/* Dock inferior fixo para celular*/}
            <Dock />

        </div>
    );
}