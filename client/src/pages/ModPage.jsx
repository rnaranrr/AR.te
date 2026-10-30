import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError, isLoggedIn } from '@/services/api';

import '@/components/form/forms.css';

import ModBar from '@/pages/mod/ModBar';
import ModPost from '@/components/ModPost';
import Logo from '@/assets/logo/icon-logo-big.svg?react';

export default function Comissions() {

    const { t } = useTranslation();
    const navigate = useNavigate();

    // Posts denunciados (carregados da API)
    const [dbPosts, setDbPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // O espaço de moderação exige login
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        let isMounted = true;

        async function loadReportedPosts() {
            try {
                const response = await api.get('/mod/posts');
                if (isMounted) setDbPosts(response.data.posts ?? []);
            } catch (err) {
                console.error('Erro ao carregar posts denunciados:', err);
                if (isMounted) setError(apiError(err, t('mod.load_error')));
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadReportedPosts();
        return () => {
            isMounted = false;
        };
    }, [t, navigate]);

    return (

        <aside className="flex flex-col min-h-dvh w-full justify-start bg-fundo font-principal text-texto-main mb-18">
            <ModBar />

            <div className='flex flex-row mt-4'>
                <div className='md:w-[50%] w-full p-4 flex-row text-center'>
                    <h1 className='font-logo text-3xl'>{t('mod.label')}</h1>
                    <p className='text-center mt-5'>{t('mod.description')}</p>
                </div>
                <Logo className='hidden md:block w-40 h-40 border-4 mt-6 border-texto rounded-2xl justify-self-center mx-auto' />
            </div>

            <p className='text-cinza pl-8 mt-8 border-t-1 border-discreto pt-4 pb-8'>{t('mod.recent')}</p>

            <div>
                {loading && <p className='text-cinza text-center'>{t('profile.loading')}</p>}
                {error && <p className='text-red-500 text-center'>{error}</p>}
                {!loading && !error && dbPosts.length === 0 && (
                    <p className='text-cinza text-center'>{t('mod.empty')}</p>
                )}

                {dbPosts.map((post) => (
                    <ModPost
                        key={post.post_id}
                        author={post.author.user_id}
                        authorname={post.author.name}
                        authorusername={post.author.username}
                        authoravatar_url={post.author.avatar_url}

                        post_id={post.post_id}
                        post_title={post.post_title}
                        post_content={post.post_content}
                        createdAt={post.createdAt}
                        post_status={post.post_status}

                        is_nsfw={post.is_nsfw}

                        media={post.media}

                        ReportCount={post.ReportCount}

                        tags={post.tags}
                    />
                ))}
            </div>
        </aside>
    );
}
