import { NavLink } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';

// Mock com a estrutura completa de um post,
// seguindo o formato utilizado no feed.
const mockPosts = [
    {
        post_id: 1,
        post_title: 'Estudo de cores',
        post_content: 'Explorando novas combinações de cores para meu próximo projeto',
        createdAt: '2026-10-10T14:30:00.000Z',
        is_nsfw: false,
        author: {
            user_id: 1,
            name: 'rnaranrr',
            username: 'rnaranrr',
            avatar_url: 'https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg'
        },
        media: [
            {
                media_id: 1,
                media_url: 'https://images.unsplash.com/photo-1770129703548-e1ced0e4f118?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
                media_type: 'image'
            },
            {
                media_id: 1,
                media_url: 'https://images.unsplash.com/photo-1770129703548-e1ced0e4f118?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
                media_type: 'image'
            }
        ],
        tags: [
            { tag_id: 1, tag_name: 'arte' },
            { tag_id: 2, tag_name: 'pintura' }
        ],
        likesCount: 189,
        commentsCount: 24,
        repostsCount: 5
    },
    {
        post_id: 2,
        post_title: 'Personagem original',
        post_content: 'Um dos meus estudos recentes de personagem',
        createdAt: '2026-10-08T17:00:00.000Z',
        is_nsfw: false,
        author: {
            user_id: 1,
            name: 'rnaranrr',
            username: 'rnaranrr',
            avatar_url: 'https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg'
        },
        media: [
            {
                media_id: 2,
                media_url: 'https://images.unsplash.com/vector-1742996363326-7a2fb198a63d?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D',
                media_type: 'image'
            }
        ],
        tags: [
            { tag_id: 3, tag_name: 'ilustração' }
        ],
        likesCount: 92,
        commentsCount: 12,
        repostsCount: 3
    },
    {
        post_id: 3,
        post_title: 'Processo criativo',
        post_content: 'Pensando sobre meu processo criativo',
        createdAt: '2026-10-05T12:00:00.000Z',
        is_nsfw: false,
        author: {
            user_id: 1,
            name: 'rnaranrr',
            username: 'rnaranrr',
            avatar_url: 'https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg'
        },
        tags: [
            { tag_id: 4, tag_name: 'processocriativo' }
        ],
        likesCount: 47,
        commentsCount: 8,
        repostsCount: 1
    }
];

// A aba mostra somente posts que possuem mídia.
export default function Media() {
    const postsWithMedia = mockPosts.filter(
        (post) => Array.isArray(post.media) && post.media.length > 0
    );

    return (
        <section className="w-full min-h-dvh bg-fundo text-texto-main px-3 py-5">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    {postsWithMedia.map((post) => {
                        const firstMedia = post.media[0];
                        const extraMediaCount = post.media.length - 1;

                        return (
                            <NavLink
                                key={post.post_id}
                                to={`/post/${post.post_id}`}
                                aria-label={`Ver publicação: ${post.post_title}${extraMediaCount > 0
                                        ? `, mais ${extraMediaCount} mídias anexadas`
                                        : ''
                                    }`}
                                className="group relative aspect-square overflow-hidden rounded-xl bg-cinza focus:outline-none focus:ring-2 focus:ring-destaque"
                            >
                                <img
                                    src={firstMedia.media_url}
                                    alt={post.post_title}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {extraMediaCount > 0 && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-cinza px-2.5 py-1 text-xs font-semibold text-[#f1f1e7] shadow">
                                        <ImageIcon size={14} />
                                        +{extraMediaCount}
                                    </div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                                    <p className="text-white text-sm font-medium">
                                        {post.post_title}
                                    </p>
                                </div>
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}