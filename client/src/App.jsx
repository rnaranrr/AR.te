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
import ProfileForm from './pages/Profile/form/ProfileForm';
import ComissionsForm from './pages/Profile/form/ComissionsForm';
import Scroll from '@/components/Scroll';

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

function NavReduced() {
    return (
        <>
            <Sidebar />
            <Outlet />
            <Dock />
        </>
    );
}

export default function App() {


    return (
        <div className='flex flex-col md:flex-row min-h-dvh bg-fundo mb-16 md:mb-0'>
            <Scroll />
            {/* Conteúdo */}
            <Routes>
                <Route element={<NavLayout />}>
                    <Route path='/feed/*' element={<Feed />} />
                    <Route path='/following/*' element={<Feed />} />
                    <Route path='/post/new' element={<NewPost />} />
                    <Route path='/*'></Route>
                    <Route path="/post/:id" element={<PostPage />} />
                </Route>

                <Route element={<NavReduced />}>
                    <Route path='/profile/' element={<Profile />} />
                    <Route path='/profile/media' element={<Profile />} />
                    <Route path='/profile/comissions' element={<Profile />} />
                    <Route path='/profile/edit' element={<ProfileForm />} />
                    <Route path='/profile/comissions/edit' element={<ComissionsForm />} />
                </Route>

                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Signin />} />
            </Routes>

        </div>
    );
}