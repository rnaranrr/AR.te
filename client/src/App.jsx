import { NavLink, useLocation, Routes, Route } from 'react-router-dom';

import Dock from '@/components/navigation/Dock';
import Sidebar from '@/components/navigation/Sidebar';
import Navbar from '@/components/navigation/Navbar';
import Feed from '@/components/feed/Feed';
import NewPost from '@/components/form/NewPost';

export default function App() {
    return (
        <div className='flex flex-col sm:flex-row min-h-screen bg-fundo'>

            {/* Nome do site fixo no topo da tela para celular*/}
            <Navbar />

            {/* Sidebar para desktop */}
            <Sidebar />

            {/* Conteúdo */}
            <Routes>
                <Route path="/feed/*" element={<Feed />} />
                <Route path="/following/*" element={<Feed />} />
                <Route path="/post/new" element={<NewPost />} />
            </Routes>
            
            <div className='h-[300vh]'></div>

            {/* Dock inferior fixo para celular*/}
            <Dock />

        </div>
    );
}