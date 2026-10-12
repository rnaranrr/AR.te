import { useTranslation } from 'react-i18next';
import Post from '@/components/Post';

export default function FeedForyou() {

    // Obtém o objeto de idioma do i18next para definir o idioma atual
    const { t } = useTranslation();

    // Simulação de um retorno do Sequelize usando .findAll({ include: [...] })
    const dbPosts = [
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
    ];

    return (
        <article className="w-full  flex flex-col justify-center items-center gap-4 mx-auto">

            {dbPosts.map((post) => (
                <Post
                    key={post.post_id}
                    author={post.author.user_id}
                    authorname={post.author.name}
                    authorusername={post.author.username}
                    authoravatar_url={post.author.avatar_url}

                    post_id={post.post_id}
                    post_title={post.post_title}
                    post_content={post.post_content}
                    createdAt={post.createdAt}

                    is_nsfw={post.is_nsfw}

                    media={post.media}

                    likesCount={post.likesCount}
                    commentsCount={post.commentsCount}
                    repostsCount={post.repostsCount}

                    tags={post.tags}
                />
            ))}

        </article>
    );
}