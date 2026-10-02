import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { EllipsisVertical, Heart, MessageCircle, RotateCcw, CircleUserRound, StickyNote, TriangleAlert, Link } from 'lucide-react';

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

    post_tags = [],
    tags = []
}) {

    // Controla se o usuário confirmou que deseja ver mídia NSFW
    const [nsfwConfirmed, setNsfwConfirmed] = useState(false);

    // Controla se o link do post já foi copiado para a área de transferência
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        if (!linkCopied) return;

        const timeoutId = setTimeout(() => setLinkCopied(false), 2500);
        return () => clearTimeout(timeoutId);
    }, [linkCopied]);

    // Determina quais tags devem ser renderizadas, priorizando post_tags sobre tags
    const renderedTags = Array.isArray(post_tags) && post_tags.length > 0
        ? post_tags
        : Array.isArray(tags) && tags.length > 0
            ? tags
            : [];

    // Controla o estado de like do post e calcula o número de likes exibido ao usuário
    const [liked, setLiked] = useState(false);
    const displayedLikes = (Number(likesCount) || 0) + (liked ? 1 : 0);

    // Função responsável pelo like do post
    function Like() {
        //IMPLEMENTAR A LÓGICA DE LIKE DEPOIS, POR ENQUANTO SÓ INVERTE O ESTADO
        setLiked((currentLiked) => !currentLiked);
    }

    // Controla o estado de repost do post e calcula o número de reposts exibido ao usuário
    const [reposted, setReposted] = useState(false);
    const displayedReposts = (Number(repostsCount) || 0) + (reposted ? 1 : 0);

    // Função responsável pelo repost do post
    function Repost() {
        //IMPLEMENTAR A LÓGICA DE REPOST DEPOIS, POR ENQUANTO SÓ INVERTE O ESTADO
        setReposted((currentRepost) => !currentRepost);
    }

    // Função responsável por copiar o link do post para a área de transferência
    async function copyPostLink(event) {
        const copyButton = event.currentTarget;
        const postLink = `${window.location.origin}/post/${post_id}`;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(postLink);
            } else {
                throw new Error('Clipboard API indisponível');
            }
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = postLink;
            textArea.setAttribute('readonly', '');
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            textArea.setSelectionRange(0, postLink.length);

            const copied = document.execCommand('copy');
            textArea.remove();

            if (!copied) {
                setLinkCopied(false);
                copyButton.blur();
                return;
            }
        }

        setLinkCopied(true);
        copyButton.blur();
    }

    // Obtém o objeto de idioma do i18next para definir o idioma atual
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

    return (
        <aside className="w-full flex flex-col justify-center items-center mx-auto">

            {/* Card do post */}
            <div className="card bg-fundo w-full max-w-120 min-w-90 rounded-none">
                <div className="card-body w-full min-w-90">

                    {/* Cabeçalho do post com informações do autor e título */}
                    <div className="flex items-center gap-3">

                        {/* Foto do autor do post */}
                        <NavLink to={`/user/${author}`}>
                            <img
                                src={authoravatar_url}
                                alt={authorname}
                                className="w-10 h-10 rounded-full"
                            />
                        </NavLink>

                        <div>
                            {/* Nome e username do autor do post */}
                            <NavLink to={`/user/${author}`} className="flex flex-col gap-1">
                                <div className="flex flex-row gap-1 items-top">
                                    <h3 className="font-bold">{authorname}</h3>
                                    <p className="text-sm text-cinza">{authorusername}</p>
                                </div>
                            </NavLink>

                            {/* Título do post */}
                            <NavLink to={`/post/${post_id}`} className="text-lg">
                                {post_title}
                            </NavLink>
                        </div>

                        {/* Menu de opções do post */}
                        <div className="dropdown dropdown-end justify-end ml-auto">
                            <div tabIndex={0} role="button" className="btn border-none bg-fundo px-0"><EllipsisVertical className="text-cinza" /></div>
                            <ul tabIndex={-1} className="dropdown-content menu bg-cinza rounded-box z-1 w-60 p-2 shadow-sm text-[#f1f1e7]">
                                <li>
                                    <NavLink to={`/user/${author}`}><CircleUserRound className="h-5 mr-2" />{t('post.author')}</NavLink>
                                </li>
                                <li>
                                    <NavLink to={`/post/${post_id}`}><StickyNote className="h-5 mr-2" />{t('post.details')}</NavLink>
                                </li>
                                <li>
                                    <NavLink to={`/post/${post_id}/report`}><TriangleAlert className="h-5 mr-2" />{t('post.report')}</NavLink>
                                </li>
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
                            <div className="mt-4">
                                {/* Se o post for NSFW e o usuário ainda não confirmou, exibe um botão para confirmar a visualização da mídia sensível */}
                                {is_nsfw && !nsfwConfirmed ? (
                                    <button
                                        type="button"
                                        onClick={() => setNsfwConfirmed(true)}
                                        className="btn w-full border-none bg-destaque text-fundo hover:bg-destaque/80 transition-colors duration-200"
                                    >
                                        {t('post.nsfw_warning')}
                                    </button>
                                ) : (

                                    //mapeia a mídia do post e renderiza imagens ou vídeos de acordo com o tipo de mídia
                                    media.map((item, index) => {
                                        const type = (item.media_type || '').toLowerCase();
                                        const key = item.media_id ?? index;

                                        //se for imagem
                                        if (type.startsWith('image')) {
                                            return (
                                                <NavLink key={key} to={`/post/${post_id}`}>
                                                    <img
                                                        src={item.media_url}
                                                        alt={`Mídia ${index + 1}`}
                                                        className="w-full rounded-lg"
                                                        loading="lazy"
                                                    />
                                                </NavLink>
                                            );
                                        }

                                        //se for vídeo
                                        if (type.startsWith('video')) {
                                            return (
                                                <video
                                                    key={key}
                                                    src={item.media_url}
                                                    controls
                                                    playsInline
                                                    preload="metadata"
                                                    className="w-full rounded-lg"
                                                >
                                                    Seu navegador não suporta vídeo.
                                                </video>
                                            );
                                        }

                                        return (
                                            <a
                                                key={key}
                                                href={item.media_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link"
                                            >
                                                Abrir mídia
                                            </a>
                                        );
                                    })

                                )}
                            </div>
                        )}

                        {/* Tags do post */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {renderedTags.map((tag) => (
                                <NavLink key={tag.tag_id} to={`/tag/${tag.tag_name}`} className="badge bg-fundo border-discreto text-cinza hover:bg-destaque hover:text-fundo transition-colors duration-200">
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
                                    className="flex items-center gap-1 hover:cursor-pointer"
                                    aria-pressed={liked}
                                >
                                    <Heart
                                        className={`interaction ${liked ? 'interactedlike' : ''
                                            }`}
                                    />
                                    <span>{displayedLikes}</span>
                                </button>

                                {/* Botão de comentários */}
                                <NavLink to={`/post/${post_id}`} className="flex items-center gap-1 hover:cursor-pointer">
                                    <MessageCircle className='interaction' />
                                    <span>{commentsCount}</span>
                                </NavLink>

                                {/* Botão de repost */}
                                <div className="dropdown dropdown-end">
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
                                                aria-pressed={reposted}>
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

            {linkCopied && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-md bg-destaque px-4 py-3 text-fundo shadow-lg sm:bottom-6"
                >
                    {t('post.link_copied')}
                </div>
            )}
        </aside>

    );
}