import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import Comment from '@/components/comments/Comment';
import '@/components/form/forms.css';

export default function Comments() {
    // Obtém o objeto de idioma do i18next para definir o idioma atual
    const { t } = useTranslation();

    //
    const [comment, setComment] = useState('');

    // Mock temporário
    const dbComm = [
        {
            comment_id: 1,
            comment_content: "Legal",
            createdAt: "2026-09-30T18:45:00.000Z",

            // Comment.belongsTo(User, { as: 'author' })
            author: {
                user_id: 201,
                name: "Bruno Costa",
                username: "@brunocosta_paints",
                avatar_url: "https://i.pravatar.cc/150?u=bruno"
            },

            likesCount: 999,
        },
        {
            comment_id: 1,
            comment_content: "Legal",
            createdAt: "2026-09-30T18:45:00.000Z",

            // Comment.belongsTo(User, { as: 'author' })
            author: {
                user_id: 201,
                name: "Bruno Costa",
                username: "@brunocosta_paints",
                avatar_url: "https://i.pravatar.cc/150?u=bruno"
            },

            likesCount: 999,
        }
    ]

    function handleSubmit(event) {
        event.preventDefault();

        if (!comment.trim()) return;

        console.log('Comentário:', comment);

        setComment('');
    }

    return (
        <section className="w-full mt-6">


            {/* Campo de comentário */}
            <div className="card align-self-center w-full bg-fundo flex flex-col items-center justify-center mb-2 px-4">
                <h2 className="max-w-xl text-xl font-bold mb-1 ml-2">
                    Comentários
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="flex gap-3 items-start mt-4 w-full flex-row justify-center max-w-xl"
                >
                    <textarea
                        type="text"
                        onChange={(event) => setComment(event.target.value)}
                        placeholder={t('comment.placeholder')}
                        rows={2}
                        className="areaform align-center"
                    />

                    <button
                        type="submit"
                        className="btn bg-destaque text-fundo border-none rounded-full w-16"
                        disabled={!comment.trim()}
                    >
                        {t('comment.send')}
                    </button>
                </form>
            </div>

            {/* Lista de comentários */}
            <div>
                {dbComm.map((comment) => (
                    <Comment
                        key={comment.comment_id}
                        author={comment.author.user_id}
                        authorname={comment.author.name}
                        authorusername={comment.author.username}
                        authoravatar_url={comment.author.avatar_url}

                        comment_id={comment.comment_id}
                        comment_content={comment.comment_content}
                        createdAt={comment.createdAt}

                        likesCount={comment.likesCount}
                    />
                ))}
            </div>


        </section>
    );
}