import { useTranslation } from 'react-i18next';
import Post from '@/components/Post';

export default function FeedFollowing() {

    // Obtém o objeto de idioma do i18next para definir o idioma atual
    const { t } = useTranslation();

    // Simulação de um retorno do Sequelize usando .findAll({ include: [...] })
    const dbPosts = [
        {
            post_id: 11,
            post_title: "Leafeon rosa",
            post_content: "Um leafeon que é rosa",
            is_nsfw: false,
            createdAt: "2026-09-30T18:45:00.000Z",

            // Post.belongsTo(User, { as: 'author' })
            author: {
                user_id: 201,
                name: "Bruno Costa",
                username: "@brunocosta_paints",
                avatar_url: "https://i.pravatar.cc/150?u=bruno"
            },
            // Post.hasMany(PostMedia, { as: 'media' })
            media: [
                { media_id: 11, media_url: "https://static1.e926.net/data/29/6a/296aa3b1bd4851b6f4ab6f0e8bcea7f4.gif", media_type: "image" }
            ],

            // Post.belongsToMany(Tag, { through: Ptag, as: 'tags' })
            tags: [
                { tag_id: 11, tag_name: "Leafeon" },
                { tag_id: 12, tag_name: "Rosa" }
            ],

            likesCount: 999,
            commentsCount: 27,
            repostsCount: 100000000
        },
        {
            post_id: 12,
            post_title: "Eevee fofinho",
            post_content: "olha que fofinho esse Eevee sla",
            is_nsfw: false,
            createdAt: "2026-09-29T10:15:00.000Z",

            // Post.belongsTo(User, { as: 'author' })
            author: {
                user_id: 202,
                name: "Lívia Mendes",
                username: "@liviartstudio",
                avatar_url: "https://i.pravatar.cc/150?u=livia"
            },
            // Post.hasMany(PostMedia, { as: 'media' })
            media: [
                { media_id: 12, media_url: "https://static1.e926.net/data/sample/b7/43/b7432b60fecedf686289ee3a5ce613ee_480p.mp4", media_type: "video" }
            ],

            // Post.belongsToMany(Tag, { through: Ptag, as: 'tags' })
            tags: [
                { tag_id: 13, tag_name: "eevee" },
                { tag_id: 14, tag_name: "fofinho" }
            ],

            likesCount: 118,
            commentsCount: 15,
            repostsCount: 4
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