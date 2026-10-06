import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import Post from '@/components/Post';
import Comments from '@/components/comments/CommentSection';

export default function PostPage() {
    const navigate = useNavigate();

    const { id } = useParams();

    // Simulação de um retorno do Sequelize usando .findAll({ include: [...] })
    const dbPosts = [
        {
            post_id: 1,
            post_title: "Minha nova pintura",
            post_content: "Acabei de finalizar a minha nova pintura!",
            is_nsfw: false,
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
            likesCount: 189,
            commentsCount: 200,
            repostsCount: 5
        }
    ]

    const post = dbPosts.find(
        (post) => post.post_id === Number(id)
    );

    return (
        <main className="w-full min-h-screen bg-fundo text-texto-main">

            {/* Cabeçalho */}
            <div className="w-full mx-auto px-4 pt-6">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-texto-main hover:text-destaque transition-colors"
                >
                    <ArrowLeft size={22} />
                    <span>Voltar</span>
                </button>
            </div>

            {/* Post */}
            <section className="w-full  mx-auto mt-4">
                <Post
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
                <Comments />
            </section>

        </main>
    );
}