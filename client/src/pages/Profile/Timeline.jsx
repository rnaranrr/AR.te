// Página: aba "Timeline" do perfil (posts e reposts)
import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Post from '@/components/Post';

// Aba "Timeline" do perfil: posts e reposts do usuário, do mais recente para o mais antigo
export default function Timeline({ posts = [], reposts = [], user }) {
    const { t } = useTranslation();

    // Junta posts e reposts em uma lista só, ordenada pela data de cada item
    // (a data de um repost é a de quando foi republicado)
    const items = [
        ...posts.map((post) => ({
            key: `post-${post.post_id}`,
            date: post.createdAt,
            post,
            isRepost: false
        })),
        ...reposts.map((repost) => ({
            key: `repost-${repost.post.post_id}`,
            date: repost.repostedAt,
            post: repost.post,
            isRepost: true
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <section className="w-full min-h-dvh bg-fundo text-texto-main px-2 py-4">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
                {items.length === 0 && (
                    <p className="text-cinza text-sm text-center py-8">{t('profile.no_posts')}</p>
                )}

                {items.map(({ key, post, isRepost }) => (
                    <div key={key}>
                        {/* Aviso de que o post foi republicado pelo dono do perfil */}
                        {isRepost && (
                            <p className="w-full max-w-120 min-w-90 mx-auto px-8 flex items-center gap-2 text-sm text-cinza">
                                <RotateCcw className="h-4 w-4" />
                                {t('profile.reposted_by', { name: user?.nickname })}
                            </p>
                        )}

                        <Post
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
                            reportedByMe={post.reportedByMe}
                            post_analysis_status={post.post_analysis_status}
                            is_raffle={post.is_raffle}
                            raffle={post.raffle}

                            tags={post.tags}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}
