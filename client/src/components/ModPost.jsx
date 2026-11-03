// Componente: card de um post denunciado no espaço de moderação
import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { EllipsisVertical, Heart, MessageCircle, RotateCcw, CircleUserRound, StickyNote, TriangleAlert, Link, X, CircleUser } from 'lucide-react';

import api, { assetUrl, apiError, isLoggedIn, isModerator, modConfig } from '@/services/api';

import '@/components/Post.css';

// Status que o moderador pode escolher no menu
const STATUS_OPTIONS = ['in_analysis', 'banned', 'restored'];

// Mostra o post com o status de moderação, o número de denúncias e as ações de moderação
export default function ModPost({
    authorname,
    authorusername,
    authoravatar_url,

    post_id,
    post_title,
    post_content,
    createdAt,

    media,

    is_nsfw,

    post_analysis_status,

    ReportCount,
    reportedByMe = false,

    // Avisam a lista (ModPage) quando o status ou as denúncias mudam
    onStatusChange,
    onReportChange,

    post_tags = [],
    tags = []
}) {
    const nameURL = String(authorusername ?? '');
    const authorProfilePath = `/user/${encodeURIComponent(nameURL)}`;

    // Controla se o usuário confirmou que deseja ver mídia NSFW
    const [nsfwConfirmed, setNsfwConfirmed] = useState(false);


    // Determina quais tags devem ser renderizadas, priorizando post_tags sobre tags
    const renderedTags = Array.isArray(post_tags) && post_tags.length > 0
        ? post_tags
        : Array.isArray(tags) && tags.length > 0
            ? tags
            : [];

    // Função de tradução e idioma atual
    const { t, i18n } = useTranslation();

    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Mensagem de erro das ações de moderação
    const [notice, setNotice] = useState('');

    // Caminho atual da URL (na tela do próprio post, clicar no card não abre nada)
    const location = useLocation();
    const isOnPostPage = location.pathname === `/mod/${post_id}`;

    // Abre a tela do post (/mod/:id) ao clicar no card, exceto em links, botões, mídia e menus
    function openPostPage(event) {
        if (event.target.closest('a, button, [role="button"], img, video, ul')) return;

        if (!isOnPostPage) navigate(`/mod/${post_id}`);
    }

    // Abre a tela do post (/mod/:id); se já estiver nela, rola até a seção de opiniões
    function openOpinions() {
        if (isOnPostPage) {
            document.getElementById('opinions')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        navigate(`/mod/${post_id}`);
    }

    // Muda o status do post (somente moderadores) e avisa a lista para atualizar
    async function changeStatus(event, status) {
        event.currentTarget.blur();
        setNotice('');

        try {
            const response = await api.put(`/mod/posts/${post_id}/status`, { status }, modConfig());
            onStatusChange?.(post_id, response.data.post_analysis_status);
        } catch (err) {
            setNotice(apiError(err, t('mod.action_error')));
        }
    }

    // Voto da comunidade: denuncia o post ou remove a denúncia do usuário logado
    async function toggleReport() {
        // Votar exige login de usuário
        if (!isLoggedIn()) {
            navigate('/login');
            return;
        }

        setNotice('');

        try {
            const response = reportedByMe
                ? await api.delete(`/posts/${post_id}/report`)
                : await api.post(`/posts/${post_id}/report`);

            onReportChange?.(post_id, response.data);
        } catch (err) {
            setNotice(apiError(err, t('mod.action_error')));
        }
    }

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
            <div className="card bg-fundo w-full max-w-120 min-w-90 border-1 border-cinza md:rounded-lg">
                <div className={`card-body w-full min-w-90 ${isOnPostPage ? '' : 'cursor-pointer'}`} onClick={openPostPage}>

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
                            <NavLink to={`/mod/${post_id}`} className="text-lg">
                                {post_title}
                            </NavLink>
                        </div>

                    </div>

                    <div className='ml-13 bg-discreto rounded-full px-4 flex flex-row justify-between'>
                        <div className='flex flex-row gap-3'>
                            <p className='font-bold'>{t('mod.post_label')} </p>
                            <p className='font-normal'>{post_id}</p>
                        </div>
                        <div className='flex flex-row gap-3'>
                            <p className='font-bold'>{t('mod.status_label')} </p>
                            <p className='font-normal'>{t(`mod.status_${post_analysis_status}`, { defaultValue: String(post_analysis_status ?? '') })}</p>
                        </div>
                    </div>

                    {/* Conteúdo do post */}
                    <div className="w-full pl-13">
                        <NavLink to={`/mod/${post_id}`}>
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

                        {/* Denúncias (voto da comunidade) e ações de moderação */}
                        <div className="card-actions justify-start mt-4">
                            <div className="flex w-full items-center gap-4">
                                {/* Denúncias: clicar no ícone denuncia o post ou remove a denúncia do usuário (como curtir e descurtir) */}
                                <button
                                    type="button"
                                    onClick={toggleReport}
                                    disabled={post_analysis_status === 'banned' && !reportedByMe}
                                    className="flex items-center gap-1 hover:cursor-pointer w-15 disabled:opacity-50 disabled:hover:cursor-not-allowed"
                                >
                                    <TriangleAlert className={`interaction ${reportedByMe ? 'interactedreport' : ''}`} />
                                    <span>{ReportCount ?? 0}</span>
                                </button>
                            </div>

                            <div className='flex flex-row gap-3 justify-center items-center mt-2'>
                                {/* Alterar status do post (somente moderadores) */}
                                {isModerator() && (
                                    <div className="dropdown w-[50%]">
                                        {/* Botão que abre o menu de status */}
                                        <div tabIndex={0} role="button" className='w-full h-15 flex items-center justify-center text-center px-4 py-2 border-2 border-destaque text-destaque rounded-xl'>
                                            {t('mod.change_status')}
                                        </div>
                                        {/* Opções de status (o status atual fica desativado) */}
                                        <ul tabIndex={-1} className="dropdown-content menu bg-cinza rounded-box z-1 w-60 p-2 shadow-sm text-[#f1f1e7]">
                                            {STATUS_OPTIONS.map((status) => (
                                                <li key={status}>
                                                    <button
                                                        type="button"
                                                        disabled={status === post_analysis_status}
                                                        onClick={(event) => changeStatus(event, status)}
                                                    >
                                                        {t(`mod.status_${status}`)}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Ver opiniões do post: abre a tela do post, onde ficam as opiniões da comunidade */}
                                <button
                                    type="button"
                                    onClick={openOpinions}
                                    className={`${isModerator() ? 'w-[50%]' : 'w-full'} h-15 flex items-center justify-center text-center px-4 py-2 border-2 border-destaque text-destaque rounded-xl hover:cursor-pointer`}
                                >
                                    {t('mod.view_opinions')}
                                </button>
                            </div>

                            {/* Erro das ações de moderação */}
                            {notice && <p role="alert" className="w-full text-center text-sm text-destaque">{notice}</p>}
                        </div>
                    </div>
                </div>
            </div >
        </aside>

    );
}
