import { useTranslation } from 'react-i18next';

import Post from '@/components/Post';

// Aba "Timeline" do perfil: posts do usuário (a API já devolve no mesmo formato do feed)
export default function Timeline({ posts = [] }) {
    const { t } = useTranslation();

    return (
        <section className="w-full min-h-dvh bg-fundo text-texto-main px-2 py-4">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
                {posts.length === 0 && (
                    <p className="text-cinza text-sm text-center py-8">{t('profile.no_posts')}</p>
                )}

                {posts.map((post) => (
                    <Post
                        key={post.post_id}
                        author={post.author?.user_id}
                        authorname={post.author?.name}
                        authorusername={post.author?.username}
                        authoravatar_url={post.author?.avatar_url}

                        post_id={post.post_id}
                        post_title={post.post_title}
                        post_content={post.post_content}
                        createdAt={post.createdAt}

                        is_nsfw={post.is_nsfw}

                        media={post.media}

                        likesCount={post.likesCount}
                        commentsCount={post.commentsCount}
                        repostsCount={post.repostsCount}
                        likedByMe={post.likedByMe}
                        repostedByMe={post.repostedByMe}

                        tags={post.tags}
                    />
                ))}
            </div>
        </section>
    );
}
