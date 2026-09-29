import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '@/components/Feed.css';

export default function Feed() {

    // Obtém o objeto de idioma do i18next para definir o idioma atual
    const { t } = useTranslation();

    // Simulação de um retorno do Sequelize usando .findAll({ include: [...] })
    const dbPosts = [
        {
            post_id: 1,
            content: "Acabei de finalizar a minha nova pintura!",
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
                { media_id: 1, media_url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8", media_type: "image" }
            ],
            // O Sequelize geralmente pode trazer contagens usando Sequelize.fn('COUNT')
            // ou arrays dependendo de como fazes a query. Vamos assumir contagens diretas.
            likesCount: 124,
            commentsCount: 18,
            repostsCount: 5
        }
    ];

    return (

        <aside className="w-full">

            {/* Aba seletora de foryou */}
            <div className="sm:pt-9 h-9 sm:h-fit font-principal bg-fundo border-b border-discreto w-full flex justify-center items-center px-4 py-2 sticky top-16 z-10 sm:top-0">
                <div className="join h-9 sm:h-fit mb-2">

                    <button className="h-9 sm:h-fit btn join-item bg-fundo border-none">
                        <NavLink
                            to='/'
                            className={({ isActive }) => isActive ? 'isActive' : ''}
                        >
                            {t('feed.foryou')}
                        </NavLink>
                    </button>

                    <div className="divider divider-horizontal"></div>

                    <button className="h-9 sm:h-fit btn join-item bg-fundo border-none">
                        <NavLink
                            to='/following'
                            className={({ isActive }) => isActive ? 'isActive' : ''}
                        >
                            {t('feed.following')}
                        </NavLink>
                    </button>

                </div>
            </div>


            {/* container principal */}
            <div className="w-full  flex flex-col justify-center items-center gap-4 mx-auto">

                <div className="card bg-fundo max-w-120 rouded-none max-w-2xl">
                    <div className="card-body">

                        <h2 className="card-title">Card Title</h2>

                        <figure>
                            <img
                                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                                alt="Shoes" />
                        </figure>

                        <p></p>

                        <div className="card-actions justify-end">

                        </div>
                    </div>
                </div>

                <div className="divider divider-vertical"></div>
            </div>
        </aside>
    );
}