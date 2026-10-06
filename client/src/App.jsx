import { Routes, Route, Outlet } from 'react-router-dom';

import Dock from '@/components/navigation/Dock';
import Sidebar from '@/components/navigation/Sidebar';
import Navbar from '@/components/navigation/Navbar';
import Feed from '@/components/feed/Feed';
import NewPost from '@/components/form/NewPost';
import Login from '@/components/form/Login';
import Signin from '@/components/form/Signin';
import PostPage from '@/pages/PostPage';

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

export default function App() {


    return (
        <div className='flex flex-col sm:flex-row min-h-screen bg-fundo mb-16 sm:mb-0'>

            {/* Conteúdo */}
            <Routes>
                <Route element={<NavLayout />}>
                    <Route path='/feed/*' element={<Feed />} />
                    <Route path='/following/*' element={<Feed />} />
                    <Route path='/post/new' element={<NewPost />} />
                    <Route path='/*'></Route>
                    <Route path="/post/:id" element={<PostPage />} />
                </Route>

                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Signin />} />
            </Routes>

        </div>
    );
}