import { useTranslation } from 'react-i18next';
import Post from '@/components/Post';

export default function FeedForyou() {

    // Obtém o objeto de idioma do i18next para definir o idioma atual
    const { t } = useTranslation();

    // Simulação de um retorno do Sequelize usando .findAll({ include: [...] })
    const dbPosts = [
        {
            post_id: 1,
            post_title: "Minha nova pintura",
            post_content: "Acabei de finalizar a minha nova pintura!",
            is_nsfw: true,
            createdAt: "2026-09-28T14:30:00.000Z",

            // Post.belongsTo(User, { as: 'author' })
            author: {
                user_id: 101,
                name: "Maria Silva",
                username: "@mariasilva_art",
                avatar_url: "https://i.pravatar.cc/150?u=maria"
            },
            // Post.hasMany(PostMedia, { as: 'media' })
            media: [
                { media_id: 1, media_url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8", media_type: "image" },
            ],

            // Post.belongsToMany(Tag, { through: Ptag, as: 'tags' })
            tags: [
                { tag_id: 1, tag_name: "arte" },
                { tag_id: 2, tag_name: "pintura" }
            ],

            // O Sequelize geralmente pode trazer contagens usando Sequelize.fn('COUNT')
            // ou arrays dependendo de como fazes a query. Vamos assumir contagens diretas.
            likesCount: 124,
            commentsCount: 18,
            repostsCount: 5
        }
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