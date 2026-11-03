// Utilitário: monta os posts no formato que o front-end espera
// Todas as rotas que devolvem posts (feed, post único, perfil, busca, moderação) usam estas funções,
// assim o JSON é idêntico em todos os lugares
import { Op } from 'sequelize';
import { User, Post, PostMedia, Tag, Ptag, Postlike, Comment, Repost, Raffle, Reports } from '../models/index.js';

// Filtro de posts "visíveis": não apagados (soft-delete) e não banidos
export const VISIBLE_POST = {
    deleted_at: null,
    post_analysis_status: { [Op.ne]: 'banned' }
};

// Includes padrão: autor, mídias e tags
export const postInclude = [
    {
        model: User,
        as: 'author',
        attributes: ['user_id', 'user_nickname', 'user_idname', 'user_pfpurl']
    },
    { model: PostMedia, as: 'media' },
    { model: Tag, as: 'tags', through: { attributes: [] } }
];

// Busca uma "página" de posts em duas etapas:
// 1) pega só os IDs já paginados (limit/offset); 2) carrega os posts completos com os includes
// Evita os problemas de LIMIT + include hasMany do Sequelize
export async function findPosts(where, { limit, offset = 0 } = {}) {
    const order = [['created_at', 'DESC'], ['post_id', 'DESC']];

    const idRows = await Post.findAll({
        where,
        attributes: ['post_id'],
        order,
        ...(limit ? { limit, offset } : {})
    });

    const ids = idRows.map((row) => row.post_id);
    if (ids.length === 0) return [];

    return Post.findAll({
        where: { post_id: { [Op.in]: ids } },
        include: postInclude,
        order
    });
}

// Converte um post do Sequelize no objeto usado pelo front
// viewerId       -> usuário logado (para likedByMe / repostedByMe), ou null
// authorOverride -> usado nas rotas de perfil, onde os posts não carregam o include do autor
export async function serializePost(post, viewerId = null, authorOverride = null) {
    const postId = post.post_id;

    // Participação em concurso: identifica o concurso (título + post do concurso) para o front exibir o selo/link
    const isEntry = Boolean(post.raffle_id) && !post.is_raffle;

    const [likesCount, commentsCount, repostsCount, myLike, myRepost, myReport, raffleRow, rafflePost] = await Promise.all([
        Postlike.count({ where: { post_id: postId } }),
        Comment.count({ where: { post_id: postId, deleted_at: null } }),
        Repost.count({ where: { post_id: postId } }),
        viewerId ? Postlike.findOne({ where: { post_id: postId, user_id: viewerId } }) : null,
        viewerId ? Repost.findOne({ where: { post_id: postId, user_id: viewerId } }) : null,
        viewerId ? Reports.findOne({ where: { post_id: postId, user_id: viewerId } }) : null,
        isEntry ? Raffle.findByPk(post.raffle_id) : null,
        isEntry
            ? Post.findOne({
                where: { raffle_id: post.raffle_id, is_raffle: true, deleted_at: null },
                attributes: ['post_id']
            })
            : null
    ]);

    const author = authorOverride ?? post.author;

    return {
        post_id: postId,
        post_title: post.post_title,
        post_content: post.post_content,
        post_analysis_status: post.post_analysis_status,
        is_nsfw: post.is_nsfw,
        createdAt: post.created_at,

        // Concursos: is_raffle = o post é o concurso; raffle = concurso ao qual a participação pertence
        is_raffle: Boolean(post.is_raffle),
        raffle_id: post.raffle_id ?? null,
        raffle: raffleRow && rafflePost
            ? { raffle_id: raffleRow.raffle_id, post_id: rafflePost.post_id, title: raffleRow.raffle_title }
            : null,

        author: author
            ? {
                user_id: author.user_id,
                name: author.user_nickname,
                username: author.user_idname,
                avatar_url: author.user_pfpurl
            }
            : null,

        media: (post.media ?? []).map((m) => ({
            media_id: m.media_id,
            media_type: m.media_type,
            media_url: m.media_url
        })),
        tags: (post.tags ?? []).map((t) => ({ tag_id: t.tag_id, tag_name: t.tag_name })),

        likesCount,
        commentsCount,
        repostsCount,
        likedByMe: Boolean(myLike),
        repostedByMe: Boolean(myRepost),
        // O usuário logado já denunciou (votou contra) este post
        reportedByMe: Boolean(myReport)
    };
}

export function serializePosts(posts, viewerId = null, authorOverride = null) {
    return Promise.all(posts.map((post) => serializePost(post, viewerId, authorOverride)));
}

// IDs de posts que possuem determinada tag (usado na busca por #tag)
export async function postIdsByTagName(like) {
    const tags = await Tag.findAll({ where: { tag_name: { [Op.like]: like } } });
    if (tags.length === 0) return [];

    const links = await Ptag.findAll({
        where: { tag_id: { [Op.in]: tags.map((t) => t.tag_id) } }
    });
    return [...new Set(links.map((l) => l.post_id))];
}
