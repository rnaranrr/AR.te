// Componente: rotas da aplicação e layouts de navegação
import { Routes, Route, Outlet } from 'react-router-dom';

import Dock from '@/components/navigation/Dock';
import Sidebar from '@/components/navigation/Sidebar';
import Navbar from '@/components/navigation/Navbar';
import Feed from '@/components/feed/Feed';
import NewPost from '@/components/form/NewPost';
import Login from '@/components/form/Login';
import Signin from '@/components/form/Signin';
import PostPage from '@/pages/PostPage';
import Profile from '@/pages/Profile';
import ProfileForm from '@/pages/Profile/form/ProfileForm';
import ComissionsForm from '@/pages/Profile/form/ComissionsForm';
import DMList from '@/pages/Messages/DMList';
import DMuser from '@/pages/Messages/DMuser';
import Scroll from '@/components/Scroll';
import SearchPage from '@/pages/SearchPage';
import ModPage from '@/pages/ModPage';

// Layout completo: barra superior, menu lateral e dock (feed e posts)
function NavLayout() {
    return (
        <>
            <Navbar />
            <Sidebar />
            <Outlet />
            <Dock />
        </>
    );
}

// Layout reduzido: sem barra superior (perfil, mensagens, pesquisa e moderação)
function NavReduced() {
    return (
        <>
            <Sidebar />
            <Outlet />
            <Dock />
        </>
    );
}

// Define todas as telas do site e a rota de cada uma
export default function App() {


    return (
        <div className='flex flex-col md:flex-row min-h-dvh bg-fundo '>
            {/* Volta ao topo a cada mudança de página */}
            <Scroll />
            {/* Rotas da aplicação */}
            <Routes>
                {/* Telas com o layout completo */}
                <Route element={<NavLayout />}>
                    {/* Feed (Para você / Seguindo) */}
                    <Route path='/feed/*' element={<Feed />} />
                    <Route path='/following/*' element={<Feed />} />
                    {/* Criação de post e de raffle */}
                    <Route path='/post/new' element={<NewPost />} />
                    <Route path='/raffle/new' element={<NewPost />} />
                    <Route path='/*'></Route>
                    {/* Post individual */}
                    <Route path="/post/:id" element={<PostPage />} />
                </Route>


                {/* Telas com o layout reduzido */}
                <Route element={<NavReduced />}>
                    {/* Perfil próprio */}
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/profile/' element={<Profile />} />
                    <Route path='/profile/media' element={<Profile />} />
                    <Route path='/profile/comissions' element={<Profile />} />

                    {/* Perfil público */}
                    <Route path='/user/' element={<Profile />} />
                    <Route path='/user/:username' element={<Profile />} />
                    <Route path='/user/:username/media' element={<Profile />} />
                    <Route path='/user/:username/comissions' element={<Profile />} />

                    {/* Edição: somente no perfil próprio */}
                    <Route path='/profile/edit' element={<ProfileForm />} />
                    <Route path='/profile/comissions/edit' element={<ComissionsForm />} />

                    {/* Mensagens diretas */}
                    <Route path='/chat' element={<DMList />} />
                    <Route path='/chat/:username' element={<DMuser />} />

                    {/* Pesquisa e moderação */}
                    <Route path='/search' element={<SearchPage />}/>
                    <Route path='/mod' element={<ModPage />}/>
                </Route>


                {/* Telas de acesso (sem menu) */}
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Signin />} />
            </Routes>

        </div>
    );
}
