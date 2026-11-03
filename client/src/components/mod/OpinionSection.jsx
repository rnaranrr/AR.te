// Componente: seção de opiniões de um post em moderação (campo para opinar e lista da comunidade)
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError, isLoggedIn } from '@/services/api';
import Opinion from '@/components/mod/Opinion';
import '@/components/form/forms.css';

// Fica no lugar da seção de comentários na tela do post em moderação
// opinions = lista atual; onAdd e onRemove avisam a tela quando uma opinião é criada ou removida
export default function OpinionSection({ postId, opinions = [], onAdd, onRemove }) {
    // Função de tradução dos textos
    const { t } = useTranslation();

    // Texto do campo de nova opinião, controle do envio e mensagem de erro
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');

    // Somente usuários logados podem opinar (moderadores sem login de usuário só leem)
    const canWrite = isLoggedIn();

    // Envia a nova opinião e a coloca no topo da lista
    async function handleSubmit(event) {
        event.preventDefault();

        const content = text.trim();
        if (!content || sending) return;

        setSending(true);
        setError('');

        try {
            const response = await api.post(`/mod/posts/${postId}/opinions`, { content });

            onAdd?.(response.data.opinion);
            setText('');
        } catch (err) {
            console.error('Erro ao enviar opinião:', err);
            setError(apiError(err, t('mod.opinion_send_error')));
        } finally {
            setSending(false);
        }
    }

    // Remove uma opinião do próprio usuário, depois de confirmar
    async function handleRemove(opinionId) {
        if (!window.confirm(t('mod.opinion_remove_confirm'))) return;

        setError('');

        try {
            await api.delete(`/mod/opinions/${opinionId}`);

            onRemove?.(opinionId);
        } catch (err) {
            console.error('Erro ao remover opinião:', err);
            setError(apiError(err, t('mod.opinion_remove_error')));
        }
    }

    return (
        <section id="opinions" className="w-full mt-6">

            {/* Campo de opinião */}
            <div className="w-full px-4 mb-2">
                <div className="card w-full max-w-xl mx-auto bg-fundo flex flex-col items-center justify-center pb-4">

                    <h2 className="max-w-xl text-xl font-bold mb-1 ml-2 flex justify-left">
                        {t('mod.opinions')}
                    </h2>

                    {/* Formulário de nova opinião (ou aviso para quem não pode opinar) */}
                    {canWrite ? (
                        <form
                            onSubmit={handleSubmit}
                            className="flex gap-3 items-start mt-4 w-full mx-4 flex-row justify-center max-w-xl"
                        >
                            <textarea
                                value={text}
                                onChange={(event) => setText(event.target.value)}
                                placeholder={t('mod.opinion_placeholder')}
                                rows={2}
                                maxLength={1000}
                                className="areaform align-center"
                            />

                            <button
                                type="submit"
                                className="btn bg-destaque text-fundo border-none rounded-full w-16"
                                disabled={!text.trim() || sending}
                            >
                                {t('mod.opinion_send')}
                            </button>
                        </form>
                    ) : (
                        <p className="text-sm text-cinza mt-4 text-center">
                            {t('mod.opinion_login')}{' '}
                            <NavLink to="/login" className="text-destaque">{t('sidebar.login')}</NavLink>
                        </p>
                    )}

                    {error && <p role="alert" className="text-destaque text-sm mt-2">{error}</p>}
                </div>
            </div>

            {/* Separador entre o campo e a lista */}
            <div className="divider divider-vertical pt-4"></div>

            {/* Lista de opiniões da comunidade */}
            <div>
                {opinions.length === 0 && (
                    <p className="text-cinza text-sm text-center py-4">{t('mod.opinion_empty')}</p>
                )}

                {opinions.map((item) => (
                    <Opinion
                        key={item.opinion_id}
                        authorname={item.author?.name}
                        authorusername={item.author?.username}
                        authoravatar_url={item.author?.avatar_url}

                        opinion_content={item.opinion_content}
                        createdAt={item.createdAt}

                        mine={item.mine}
                        onRemove={() => handleRemove(item.opinion_id)}
                    />
                ))}
            </div>

        </section>
    );
}
