// Componente: card de post com mídia, tags e botões de interação
import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { assetUrl, apiError, getStoredUser, isLoggedIn } from '@/services/api';

import { EllipsisVertical, Heart, MessageCircle, RotateCcw, CircleUserRound, StickyNote, TriangleAlert, Trash2, Link, X, CircleUser } from 'lucide-react';

import '@/components/Post.css';

// Componente Post recebe os dados do post, incluindo autor, título, conteúdo, mídia, tags e contadores de interações
export default function Post({
    author,
    authorname,
    authorusername,
    authoravatar_url,

    post_id,
    post_title,
    post_content,
    createdAt,

    media,

    is_nsfw,

    likesCount,
    commentsCount,
    repostsCount,

    // Estado das interações do usuário logado (vem da API)
    likedByMe = false,
    repostedByMe = false,
    reportedByMe = false,

    // Concursos: is_raffle = este post é o concurso; raffle = concurso do qual este post participa
    is_raffle = false,
    raffle = null,

    // Status de moderação do post (default, in_analysis, restored ou banned)
    post_analysis_status = 'default',

    post_tags = [],
    tags = []
}) {
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();
    // Caminho do perfil do autor (@username na URL)
    const nameURL = String(authorusername ?? '');
    const authorProfilePath = `/user/${encodeURIComponent(nameURL)}`;

    // Controla se o usuário confirmou que deseja ver mídia NSFW
    const [nsfwConfirmed, setNsfwConfirmed] = useState(false);

    // Controla se o link do post já foi copiado para a área de transferência
    const [linkCopied, setLinkCopied] = useState(false);

    // Função para resetar o estado de linkCopied após 2,5 segundos
    useEffect(() => {
        if (!linkCopied) return;

        const timeout = setTimeout(() => setLinkCopied(false), 2500);
        return () => clearTimeout(timeout);
    }, [linkCopied]);

    // Controla se a imagem do post está sendo exibida em tela cheia
    const [fullscreenImage, setFullscreenImage] = useState(null);

    // Em tela cheia: bloqueia a rolagem da página e fecha com a tecla Esc
    useEffect(() => {
        if (!fullscreenImage) return;

        const OverflowAnterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Fecha a imagem ao pressionar Esc
        function closeOnEscape(event) {
            if (event.key === 'Escape') setFullscreenImage(null);
        }

        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = OverflowAnterior;
            window.removeEventListener('keydown', closeOnEscape);
        };
    });

    // Determina quais tags devem ser renderizadas, priorizando post_tags sobre tags
    const renderedTags = Array.isArray(post_tags) && post_tags.length > 0
        ? post_tags
        : Array.isArray(tags) && tags.length > 0
            ? tags
            : [];

    // Estado de like/repost e contadores. Os valores iniciais vêm do servidor (já incluem a interação do usuário)
    const [liked, setLiked] = useState(Boolean(likedByMe));
    const [displayedLikes, setDisplayedLikes] = useState(Number(likesCount) || 0);
    const [reposted, setReposted] = useState(Boolean(repostedByMe));
    const [displayedReposts, setDisplayedReposts] = useState(Number(repostsCount) || 0);

    // Mensagem curta (toast) para erros e avisos de ações do post
    const [notice, setNotice] = useState('');

    // O usuário logado já denunciou este post (o menu mostra "Denunciar" ou "Remover denúncia")
    const [reported, setReported] = useState(Boolean(reportedByMe));

    // Post excluído pelo autor: deixa de ser exibido
    const [removed, setRemoved] = useState(false);

    // Caminho atual da URL (usado para sair da página de um post que acabou de ser excluído)
    const location = useLocation();

    // O usuário logado é o autor deste post
    const isAuthor = Boolean(author) && getStoredUser()?.id === author;

    // Esconde o aviso depois de 3 segundos
    useEffect(() => {
        if (!notice) return;

        const timeout = setTimeout(() => setNotice(''), 3000);
        return () => clearTimeout(timeout);
    }, [notice]);

    // Impede cliques repetidos enquanto uma requisição de like/repost está em andamento
    const pendingRef = useRef(false);

    // Alterna uma interação (like ou repost)
    // 1) atualiza a tela na hora (otimista); 2) chama a API; 3) confirma com os valores do servidor
    // ou desfaz a alteração caso a requisição falhe
    async function toggleInteraction({ endpoint, active, setActive, setCount, activeKey, countKey }) {
        // Interagir exige login
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        if (pendingRef.current) return;
        pendingRef.current = true;

        setActive(!active);
        setCount((current) => Math.max(0, current + (active ? -1 : 1)));

        try {
            const response = await api.post(`/posts/${post_id}/${endpoint}`);

            setActive(response.data[activeKey]);
            setCount(response.data[countKey]);
        } catch (err) {
            // Desfaz a alteração otimista
            setActive(active);
            setCount((current) => Math.max(0, current + (active ? 1 : -1)));
            setNotice(apiError(err, t('post.action_error')));
        } finally {
            pendingRef.current = false;
        }
    }

    // Função responsável pelo like do post
    function Like() {
        return toggleInteraction({
            endpoint: 'like',
            active: liked,
            setActive: setLiked,
            setCount: setDisplayedLikes,
            activeKey: 'liked',
            countKey: 'likesCount'
        });
    }

    // Função responsável pelo repost do post
    function Repost() {
        return toggleInteraction({
            endpoint: 'repost',
            active: reposted,
            setActive: setReposted,
            setCount: setDisplayedReposts,
            activeKey: 'reposted',
            countKey: 'repostsCount'
        });
    }

    // Função responsável por denunciar o post ou remover a denúncia do usuário (a denúncia é o voto da comunidade)
    // O servidor coloca o post automaticamente "Em análise" na primeira denúncia
    async function toggleReport(event) {
        event.currentTarget.blur();

        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        // Só pede confirmação ao denunciar; remover a denúncia é imediato
        if (!reported && !window.confirm(t('post.report_confirm'))) return;

        try {
            if (reported) {
                await api.delete(`/posts/${post_id}/report`);
                setReported(false);
                setNotice(t('post.report_removed'));
            } else {
                await api.post(`/posts/${post_id}/report`);
                setReported(true);
                setNotice(t('post.reported_ok'));
            }
        } catch (err) {
            setNotice(apiError(err, t('post.action_error')));
        }
    }

    // Função responsável por excluir o post do autor (exclusão lógica: o post deixa de ser exibido)
    async function deletePost(event) {
        event.currentTarget.blur();

        if (!window.confirm(t('post.delete_confirm'))) return;

        try {
            await api.delete(`/posts/${post_id}`);
            setRemoved(true);

            // Se o post excluído estava aberto na própria página, volta para o feed
            if (location.pathname === `/post/${post_id}`) navigate('/feed');
        } catch (err) {
            setNotice(apiError(err, t('post.action_error')));
        }
    }

    // Função responsável por copiar o link do post para a área de transferência
    async function copyPostLink(event) {
        const copyButton = event.currentTarget;
        const postLink = `${window.location.origin}/post/${post_id}`;

        let copied = false;

        if (navigator.clipboard?.writeText) {
            try {
                // Tenta primeiro a API moderna de área de transferência
                await navigator.clipboard.writeText(postLink);
                copied = true;
            } catch {
                // Sem permissão para a área de transferência: segue para a alternativa abaixo
            }
        }

        // Alternativa para navegadores sem essa API: usa um campo de texto escondido e o comando de cópia antigo
        if (!copied) {
            const textArea = document.createElement('textarea');
            textArea.value = postLink;
            textArea.setAttribute('readonly', '');
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();

            try {
                copied = document.execCommand('copy');
            } finally {
                textArea.remove();
            }
        }

        if (!copied) return;

        setLinkCopied(true);
        copyButton.blur();
    }

    // Função de tradução e idioma atual
    const { t, i18n } = useTranslation();

    // Formata a data de criação do post de acordo com o idioma atual
    const dateLocale = i18n.language?.toLowerCase().startsWith('pt')
        ? 'pt-BR'
        : 'en-US';
    const formattedCreatedAt = createdAt
        ? new Intl.DateTimeFormat(dateLocale, {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(createdAt))
        : '';

    // Post excluído pelo autor não é mais exibido
    if (removed) return null;

    return (
        <aside className="w-full flex flex-col justify-center items-center mx-auto">

            {/* Card do post */}
            <div className="card bg-fundo w-full max-w-120 min-w-90 rounded-none">
                <div className="card-body w-full min-w-90">

                    {/* Cabeçalho do post com informações do autor e título */}
                    <div className="flex items-center gap-3">

                        {/* Foto do autor do post */}
                        <NavLink to={authorProfilePath}>
                            {authoravatar_url ? (
                                <img
                                    src={assetUrl(authoravatar_url)}
                                    className="w-10 h-10 rounded-full"
                                />
                            ) : (
                                <CircleUser className="w-10 h-10 rounded-full bg-fundo text-texto-main stroke-1" />
                            )}
                        </NavLink>

                        <div>
                            {/* Nome e username do autor do post */}
                            <NavLink to={authorProfilePath} className="flex flex-col gap-1 mb-1">
                                <div className="flex flex-row gap-1 items-top">
                                    <h3 className="font-bold">{authorname}</h3>
                                    <p className="text-sm text-cinza">@{authorusername}</p>
                                </div>
                            </NavLink>

                            {/* Título do post */}
                            <NavLink to={`/post/${post_id}`} className="text-lg">
                                {post_title}
                            </NavLink>

                            {/* Selo: este post é um concurso */}
                            {is_raffle && (
                                <span className="badge bg-destaque border-destaque text-fundo ml-2">
                                    {t('post.raffle')}
                                </span>
                            )}

                            {/* Selo: post em análise pela moderação */}
                            {post_analysis_status === 'in_analysis' && (
                                <span className="badge bg-fundo border-destaque text-destaque ml-2">
                                    {t('post.in_analysis')}
                                </span>
                            )}

                            {/* Selo: este post participa de um concurso (link para a página do concurso) */}
                            {raffle && (
                                <NavLink
                                    to={`/post/${raffle.post_id}`}
                                    className="block text-sm text-destaque"
                                >
                                    {t('post.raffle_entry', { title: raffle.title })}
                                </NavLink>
                            )}
                        </div>

                        {/* Menu de opções do post */}
                        <div className="dropdown dropdown-end justify-end ml-auto">
                            <div tabIndex={0} role="button" className="btn border-none bg-fundo px-0"><EllipsisVertical className="text-cinza" /></div>
                            <ul tabIndex={-1} className="dropdown-content menu bg-cinza rounded-box z-1 w-60 p-2 shadow-sm text-[#f1f1e7]">
                                <li>
                                    <NavLink to={authorProfilePath}><CircleUserRound className="h-5 mr-2" />{t('post.author')}</NavLink>
                                </li>
                                <li>
                                    <NavLink to={`/post/${post_id}`}><StickyNote className="h-5 mr-2" />{t('post.details')}</NavLink>
                                </li>
                                <li>
                                    <button type="button" onClick={toggleReport}><TriangleAlert className="h-5 mr-2" />{reported ? t('post.report_remove') : t('post.report')}</button>
                                </li>
                                {/* Excluir post (somente o autor) */}
                                {isAuthor && (
                                    <li>
                                        <button type="button" onClick={deletePost}><Trash2 className="h-5 mr-2" />{t('post.delete')}</button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Conteúdo do post */}
                    <div className="w-full pl-13">
                        <NavLink to={`/post/${post_id}`}>
                            {post_content}
                        </NavLink>

                        {/* Mídia do post */}
                        {media && media.length > 0 && (
                            <div className={`mt-4 ${media.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
                                {/* Se o post for NSFW e o usuário ainda não confirmou, exibe um botão para confirmar a visualização da mídia sensível */}
                                {is_nsfw && !nsfwConfirmed ? (
                                    <button
                                        type="button"
                                        onClick={() => setNsfwConfirmed(true)}
                                        className="block relative w-full overflow-hidden rounded-lg border-none bg-discreto text-texto-main hover:bg-destaque/80 transition-colors duration-200 col-span-2"
                                    >
                                        {/* Renderiza a primeira mídia para ajustar o tamanho do botão */}
                                        {media[0]?.media_type?.toLowerCase().startsWith('image') && (
                                            <img
                                                src={assetUrl(media[0].media_url)}
                                                className="invisible block w-full rounded-lg"
                                            />
                                        )}
                                        {media[0]?.media_type?.toLowerCase().startsWith('video') && (
                                            <video
                                                src={assetUrl(media[0].media_url)}
                                                preload="metadata"
                                                playsInline
                                                className="invisible block w-full rounded-lg"
                                            />
                                        )}
                                        <span className="absolute inset-0 flex items-center w-full ml-auto justify-center">
                                            {t('post.nsfw_warning')}
                                        </span>
                                    </button>
                                ) : (

                                    // Mapeia a mídia do post e renderiza imagens ou vídeos de acordo com o tipo de mídia
                                    media.map((item, index) => {
                                        const type = (item.media_type || '').toLowerCase();
                                        const key = item.media_id ?? index;
                                        const thirdPost = media.length === 3 && index === 2;

                                        // Se for imagem
                                        if (type.startsWith('image')) {
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setFullscreenImage({
                                                        src: assetUrl(item.media_url),
                                                    })}
                                                    className={`block w-full cursor-zoom-in ${media.length === 3 && index === 2 ? 'col-span-2' : ''}`}
                                                >
                                                    <img
                                                        src={assetUrl(item.media_url)}
                                                        className={`w-full rounded-lg max-h-xl object-cover
                                                        ${media.length > 1 ? thirdPost ? 'aspect-[2/1] object-cover' : 'aspect-square object-cover' : ''}`}
                                                        loading="lazy"
                                                    />
                                                </button>
                                            );
                                        }

                                        // Se for vídeo
                                        if (type.startsWith('video')) {
                                            return (
                                                <video
                                                    key={key}
                                                    src={assetUrl(item.media_url)}
                                                    controls
                                                    playsInline
                                                    preload="metadata"
                                                    className={`w-full rounded-lg max-h-xl object-cover
                                                        ${media.length > 1 ? thirdPost ? 'aspect-[2/1] object-cover' : 'aspect-square object-cover' : ''} ${thirdPost ? 'col-span-2' : ''}`}
                                                />
                                            );
                                        }

                                        return (
                                            <a
                                                key={key}
                                                href={assetUrl(item.media_url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`link ${media.length === 3 && index === 2 ? 'col-span-2' : ''}`}
                                            >
                                                {t('post.open_media')}
                                            </a>
                                        );
                                    })

                                )}
                            </div>
                        )}

                        {/* Tags do post */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {renderedTags.map((tag) => (
                                <NavLink key={tag.tag_id} to={`/search?q=${encodeURIComponent('#' + tag.tag_name)}`} className="badge bg-fundo border-discreto text-cinza hover:bg-destaque hover:text-fundo transition-colors duration-200">
                                    {tag.tag_name}
                                </NavLink>
                            ))}

                            {/* Data de criação do post */}
                            <p className="text-sm text-cinza flex flex-row items-center justify-end ml-auto">
                                {formattedCreatedAt}
                            </p>
                        </div>

                        {/* Contadores de likes, comentários e reposts */}
                        <div className="card-actions justify-start mt-4">
                            <div className="flex w-full items-center gap-4">
                                {/* Botão de like */}
                                <button
                                    onClick={Like}
                                    className="flex items-center gap-1 hover:cursor-pointer w-15"
                                >
                                    <Heart
                                        className={`interaction ${liked ? 'interactedlike' : ''
                                            }`}
                                    />
                                    <span>{displayedLikes}</span>
                                </button>

                                {/* Botão de comentários */}
                                <NavLink to={`/post/${post_id}`} className="flex items-center gap-1 hover:cursor-pointer w-15">
                                    <MessageCircle className='interaction' />
                                    <span>{commentsCount}</span>
                                </NavLink>

                                {/* Botão de repost */}
                                <div className="dropdown dropdown-end w-15">
                                    <div tabIndex={0} role="button" className="btn border-none bg-fundo px-0 font-normal">
                                        <RotateCcw className={`interaction ${reposted ? 'interactedrepost' : ''}`} />
                                        <span>{displayedReposts}</span>
                                    </div>
                                    <ul tabIndex={-1} className="dropdown-content menu bg-cinza rounded-box z-1 w-34 p-2 shadow-sm text-[#f1f1e7]">
                                        <li>
                                            <button
                                                onClick={(event) => {
                                                    Repost();
                                                    event.currentTarget.blur();
                                                }}
                                                className="flex items-center gap-1 hover:cursor-pointer"
                                            >
                                                <RotateCcw className="h-5 w-5" />
                                                {reposted
                                                    ? <p className='pl-2 w-10'>{t('post.reposted')}</p>
                                                    : <p>{t('post.repost')}</p>}

                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                {/* Botão de copiar link do post */}
                                <button type="button" className="ml-auto flex hover:cursor-pointer hover:text-destaque" onClick={copyPostLink}>
                                    <Link className="h-5 mr-2" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div >

            <div className="divider divider-vertical"></div>

            {/* Renderiza a imagem em tela cheia se fullscreenImage estiver definido */}
            {fullscreenImage && (
                <div
                    role="dialog"
                    onClick={() => setFullscreenImage(null)}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#120f22] p-4"
                >
                    <button
                        type="button"
                        onClick={() => setFullscreenImage(null)}
                        className="absolute right-4 top-4 z-10 rounded-full bg-cinza p-2 text-white hover:bg-discreto transition-colors duration-200"
                    >
                        <X className="text-[#f1f1e7]" />
                    </button>
                    <img
                        src={fullscreenImage.src}
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-[calc(100vh-2rem)] max-w-full object-contain"
                    />
                </div>
            )}

            {/* Toast de erros e avisos (denúncia enviada, falha ao curtir etc.) */}
            {notice && (
                <div
                    role="status"
                    className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-md bg-destaque px-4 py-3 text-fundo shadow-lg md:bottom-6"
                >
                    {notice}
                </div>
            )}

            {/* Toast de quando o link do post é copiado */}
            {linkCopied && (
                <div
                    role="status"
                    className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-md bg-destaque px-4 py-3 text-fundo shadow-lg md:bottom-6"
                >
                    {t('post.link_copied')}
                </div>
            )}
        </aside>

    );
}
