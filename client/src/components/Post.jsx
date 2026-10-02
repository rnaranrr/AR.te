import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { EllipsisVertical, Heart, MessageCircle, RotateCcw, CircleUserRound, StickyNote, TriangleAlert, Link, X } from 'lucide-react';

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

    // Função para resetar o estado de linkCopied após 2,5 segundos
    useEffect(() => {
        if (!linkCopied) return;

        const timeout = setTimeout(() => setLinkCopied(false), 2500);
        return () => clearTimeout(timeout);
    }, [linkCopied]);

    // Controla se a imagem do post está sendo exibida em tela cheia
    const [fullscreenImage, setFullscreenImage] = useState(null);

    // Função para fechar a imagem em tela cheia ao pressionar Esc
    useEffect(() => {
        if (!fullscreenImage) return;

        const OverflowAnterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

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

        let copied = false;

        if (navigator.clipboard?.writeText) {
            try {
                //manda pra área de transferência o link do post igual um ser normal
                await navigator.clipboard.writeText(postLink);
                copied = true;
            } catch {
            }
        }

        // manda pra área de transferência o link do post de maneira satânica
        // Honestamente não entendi essa maracutaia, mas funcionando tá valendo
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
                            <div className={`mt-4 ${media.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
                                {/* Se o post for NSFW e o usuário ainda não confirmou, exibe um botão para confirmar a visualização da mídia sensível */}
                                {is_nsfw && !nsfwConfirmed ? (
                                    <button
                                        type="button"
                                        onClick={() => setNsfwConfirmed(true)}
                                        className="btn w-full border-none bg-destaque text-fundo hover:bg-destaque/80 transition-colors duration-200 col-span-2"
                                    >
                                        {t('post.nsfw_warning')}
                                    </button>
                                ) : (

                                    //mapeia a mídia do post e renderiza imagens ou vídeos de acordo com o tipo de mídia
                                    media.map((item, index) => {
                                        const type = (item.media_type || '').toLowerCase();
                                        const key = item.media_id ?? index;
                                        const thirdPost = media.length === 3 && index === 2;

                                        //se for imagem
                                        if (type.startsWith('image')) {
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setFullscreenImage({
                                                        src: item.media_url,
                                                        alt: `Mídia ${index + 1}`
                                                    })}
                                                    className={`block w-full cursor-zoom-in ${media.length === 3 && index === 2 ? 'col-span-2' : ''}`}
                                                >
                                                    <img
                                                        src={item.media_url}
                                                        alt={`Mídia ${index + 1}`}
                                                        className={`w-full rounded-lg 
                                                        ${media.length > 1 ? thirdPost ? 'aspect-[2/1] object-cover' : 'aspect-square object-contain' : ''}`}
                                                        loading="lazy"
                                                    />
                                                </button>
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
                                                    className={`w-full rounded-lg ${media.length > 1 ? thirdPost ? 'aspect-[2/1] object-cover' : 'aspect-square object-contain' : ''} ${thirdPost ? 'col-span-2' : ''}`}
                                                />
                                            );
                                        }

                                        return (
                                            <a
                                                key={key}
                                                href={item.media_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`link ${media.length === 3 && index === 2 ? 'col-span-2' : ''}`}
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
                        alt={fullscreenImage.alt}
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-[calc(100vh-2rem)] max-w-full object-contain"
                    />
                </div>
            )}

            {/* Toast de quando o link do post é copiado */}
            {linkCopied && (
                <div
                    role="status"
                    className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-md bg-destaque px-4 py-3 text-fundo shadow-lg sm:bottom-6"
                >
                    {t('post.link_copied')}
                </div>
            )}
        </aside>

    );
}