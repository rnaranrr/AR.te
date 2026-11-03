// Utilitário: mantém as opiniões da moderação ligadas a uma denúncia que existe
import { Op } from 'sequelize';

import { Opinion, Reports } from '../models/index.js';

// Antes de apagar uma denúncia, move as opiniões ligadas a ela para a próxima denúncia do mesmo post
// Se não houver outra denúncia, as opiniões são apagadas (a coluna opinion.report_id é obrigatória)
export async function releaseReportOpinions(report, transaction) {
    const linked = await Opinion.count({ where: { report_id: report.report_id }, transaction });
    if (linked === 0) return;

    // Próxima denúncia do mesmo post (a mais antiga que não seja a que será apagada)
    const next = await Reports.findOne({
        where: { post_id: report.post_id, report_id: { [Op.ne]: report.report_id } },
        order: [['report_id', 'ASC']],
        transaction
    });

    if (next) {
        await Opinion.update(
            { report_id: next.report_id },
            { where: { report_id: report.report_id }, transaction }
        );
    } else {
        await Opinion.destroy({ where: { report_id: report.report_id }, transaction });
    }
}
