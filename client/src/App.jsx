// Componente: rotas da aplicação e layouts de navegação
import { Routes, Route, Outlet } from 'react-router-dom';

import RequireAuth from '@/components/auth/RequireAuth';
import GuestOnly from '@/components/auth/GuestOnly';
import HomeRedirect from '@/components/auth/HomeRedirect';

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
import ModLogin from '@/pages/mod/ModLogin';
import ModCreate from '@/pages/mod/ModCreate';
import ModPage from '@/pages/ModPage';
import ModPostPage from '@/pages/ModPostPage';
import FollowList from '@/pages/FollowList';

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
// Acesso: visitantes só veem o login, o cadastro, o feed "Para você", os posts e os perfis públicos;
// o restante exige login de usuário e a moderação exige usuário ou moderador (cadastro de moderador: só moderador)
export default function App() {

    return (
        <div className='flex flex-col md:flex-row min-h-dvh bg-fundo '>
            {/* Volta ao topo a cada mudança de página */}
            <Scroll />
            {/* Rotas da aplicação */}
            <Routes>
                {/* Rota inicial: feed (logado) ou login (visitante) */}
                <Route path='/' element={<HomeRedirect />} />

                {/* Telas com o layout completo */}
                <Route element={<NavLayout />}>
                    {/* Públicas: visitantes podem ver o feed "Para você" e os posts */}
                    <Route path='/feed/*' element={<Feed />} />
                    <Route path="/post/:id" element={<PostPage />} />

                    {/* Exigem login de usuário */}
                    <Route element={<RequireAuth />}>
                        {/* Aba "Seguindo" */}
                        <Route path='/following/*' element={<Feed />} />
                        {/* Criação de post e de raffle */}
                        <Route path='/post/new' element={<NewPost />} />
                        <Route path='/raffle/new' element={<NewPost />} />
                    </Route>
                </Route>


                {/* Telas com o layout reduzido */}
                <Route element={<NavReduced />}>
                    {/* Públicas: perfil de outros usuários */}
                    <Route path='/user/:username' element={<Profile />} />
                    <Route path='/user/:username/media' element={<Profile />} />
                    <Route path='/user/:username/comissions' element={<Profile />} />
                    {/* Seguidores e seguindo de um perfil */}
                    <Route path='/user/:username/followers' element={<FollowList />} />
                    <Route path='/user/:username/following' element={<FollowList />} />

                    {/* Exigem login de usuário */}
                    <Route element={<RequireAuth />}>
                        {/* Perfil próprio */}
                        <Route path='/profile' element={<Profile />} />
                        <Route path='/profile/' element={<Profile />} />
                        <Route path='/profile/media' element={<Profile />} />
                        <Route path='/profile/comissions' element={<Profile />} />
                        <Route path='/user/' element={<Profile />} />
                        {/* Seguidores e seguindo do perfil próprio */}
                        <Route path='/profile/followers' element={<FollowList />} />
                        <Route path='/profile/following' element={<FollowList />} />

                        {/* Edição: somente no perfil próprio */}
                        <Route path='/profile/edit' element={<ProfileForm />} />
                        <Route path='/profile/comissions/edit' element={<ComissionsForm />} />

                        {/* Mensagens diretas */}
                        <Route path='/chat' element={<DMList />} />
                        <Route path='/chat/:username' element={<DMuser />} />

                        {/* Pesquisa */}
                        <Route path='/search' element={<SearchPage />}/>
                    </Route>

                    {/* Moderação: usuário logado ou moderador */}
                    <Route element={<RequireAuth access='any' />}>
                        <Route path='/mod' element={<ModPage />}/>
                        <Route path='/mod/:postid' element={<ModPostPage />}/>
                    </Route>

                    {/* Cadastro de moderadores: somente moderador logado */}
                    <Route element={<RequireAuth access='moderator' />}>
                        <Route path='/mod/create' element={<ModCreate />}/>
                    </Route>
                </Route>


                {/* Telas de acesso (sem menu): quem já está logado é redirecionado */}
                <Route element={<GuestOnly />}>
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Signin />} />
                </Route>
                <Route element={<GuestOnly kind='moderator' />}>
                    <Route path='/mod/login' element={<ModLogin />} />
                </Route>

                {/* Endereços desconhecidos voltam para a tela inicial */}
                <Route path='*' element={<HomeRedirect />} />
            </Routes>

        </div>
    );
}
