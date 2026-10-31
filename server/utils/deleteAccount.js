// Utilitário: exclusão de conta (apaga o usuário e tudo o que depende dele em uma única transação)
import { Op } from 'sequelize';
import {
    database,
    User,
    Post,
    PostMedia,
    Ptag,
    Postlike,
    Repost,
    Comment,
    Commlike,
    Reports,
    Opinion,
    Raffle,
    Follow,
    Chat,
    Moderator
} from '../models/index.js';

// Apaga a conta e todas as produções do usuário
// As chaves estrangeiras não têm exclusão em cascata, então a ordem abaixo (dos dependentes para o usuário) é obrigatória
// Retorna as URLs dos arquivos que devem ser removidos do disco depois que a transação for confirmada
export async function deleteUserAccount(userId) {
    const transaction = await database.transaction();

    try {
        const user = await User.findByPk(userId, { transaction });
        if (!user) {
            await transaction.rollback();
            return null;
        }

        // Posts do usuário e concursos que ele criou
        const posts = await Post.findAll({ where: { user_id: userId }, transaction });
        const postIds = posts.map((post) => post.post_id);
        const raffleIds = posts
            .filter((post) => post.is_raffle && post.raffle_id)
            .map((post) => post.raffle_id);

        // Mídias dos posts (os arquivos são apagados do disco depois)
        const media = await PostMedia.findAll({
            where: { post_id: { [Op.in]: postIds } },
            transaction
        });

        // Comentários: os feitos pelo usuário e todos os que estão nos posts dele
        const comments = await Comment.findAll({
            where: {
                [Op.or]: [{ post_id: { [Op.in]: postIds } }, { user_id: userId }]
            },
            attributes: ['comment_id'],
            transaction
        });
        const commentIds = comments.map((comment) => comment.comment_id);

        // Curtidas de comentários (dadas pelo usuário ou recebidas nos comentários apagados)
        await Commlike.destroy({
            where: {
                [Op.or]: [{ comment_id: { [Op.in]: commentIds } }, { user_id: userId }]
            },
            transaction
        });
        await Comment.destroy({ where: { comment_id: { [Op.in]: commentIds } }, transaction });

        // Curtidas e reposts (dados pelo usuário ou recebidos nos posts dele)
        for (const Model of [Postlike, Repost]) {
            await Model.destroy({
                where: {
                    [Op.or]: [{ post_id: { [Op.in]: postIds } }, { user_id: userId }]
                },
                transaction
            });
        }

        // Denúncias (feitas pelo usuário ou contra os posts dele) e as opiniões ligadas a elas
        const reports = await Reports.findAll({
            where: {
                [Op.or]: [{ post_id: { [Op.in]: postIds } }, { user_id: userId }]
            },
            attributes: ['report_id'],
            transaction
        });
        const reportIds = reports.map((report) => report.report_id);

        await Opinion.destroy({
            where: {
                [Op.or]: [{ report_id: { [Op.in]: reportIds } }, { user_id: userId }]
            },
            transaction
        });
        await Reports.destroy({ where: { report_id: { [Op.in]: reportIds } }, transaction });

        // Tags e mídias dos posts
        await Ptag.destroy({ where: { post_id: { [Op.in]: postIds } }, transaction });
        await PostMedia.destroy({ where: { post_id: { [Op.in]: postIds } }, transaction });

        // Participações de outros usuários nos concursos do usuário viram posts comuns
        if (raffleIds.length > 0) {
            await Post.update(
                { raffle_id: null },
                {
                    where: {
                        raffle_id: { [Op.in]: raffleIds },
                        user_id: { [Op.ne]: userId }
                    },
                    transaction
                }
            );
        }

        // Posts do usuário e, depois deles, os concursos que ele criou
        await Post.destroy({ where: { user_id: userId }, transaction });
        if (raffleIds.length > 0) {
            await Raffle.destroy({ where: { raffle_id: { [Op.in]: raffleIds } }, transaction });
        }

        // Relações sociais e mensagens diretas (nos dois sentidos)
        await Follow.destroy({
            where: { [Op.or]: [{ follower_id: userId }, { following_id: userId }] },
            transaction
        });
        await Chat.destroy({
            where: { [Op.or]: [{ chat_send_id: userId }, { chat_receiver_id: userId }] },
            transaction
        });

        // Se o usuário também era moderador, a conta de moderador é mantida, mas sem vínculo com o perfil
        await Moderator.update(
            { moderator_userprofile: null },
            { where: { moderator_userprofile: userId }, transaction }
        );

        // Por fim, o próprio usuário
        await user.destroy({ transaction });

        await transaction.commit();

        // Arquivos que não são mais usados por ninguém
        return [
            user.user_pfpurl,
            user.user_bannerurl,
            user.user_commtab_bannerurl,
            user.user_commtab_imgurl,
            ...media.map((item) => item.media_url)
        ].filter(Boolean);
    } catch (error) {
        if (!transaction.finished) await transaction.rollback();
        throw error;
    }
}
