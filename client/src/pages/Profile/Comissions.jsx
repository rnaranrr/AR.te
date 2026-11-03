// Página: aba "Comissões" do perfil (status, banner e tabela de preços)
import { useTranslation } from 'react-i18next';

import { assetUrl } from '@/services/api';

// Mostra o status das comissões e, se o artista cadastrou, o banner e a tabela de preços
// Banner e tabela ausentes não ocupam espaço nenhum na tela
export default function Comissions({ user }) {
    const { t } = useTranslation();

    return (
        <aside className="min-h-dvh w-full bg-fundo px-3 py-5 text-texto-main">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-4">

                {/* Status: comissões abertas ou fechadas */}
                <div className="flex items-center justify-between py-4">
                    <span className="text-sm font-semibold">
                        {t('profile.commissions_status')}
                    </span>

                    <span
                        className={`rounded-full px-4 py-1 ${user.commissions_open
                                ? 'bg-destaque text-[#f1f1e7]'
                                : 'bg-discreto'
                            }`}
                    >
                        {user.commissions_open
                            ? t('profile.commissions_open')
                            : t('profile.commissions_closed')}
                    </span>
                </div>

                {/* Banner de apresentação das comissões (só aparece se existir) */}
                {user.commissions_banner_url && (
                    <img
                        src={assetUrl(user.commissions_banner_url)}
                        alt={t('profileform.commissions_banner_label')}
                        className="h-40 w-full rounded-xl bg-cinza object-cover sm:h-48"
                    />
                )}

                {/* Tabela de preços (só aparece se existir) */}
                {user.commissions_image_url && (
                    <img
                        src={assetUrl(user.commissions_image_url)}
                        alt={t('profileform.commissions_image_label')}
                        className="max-h-[70dvh] min-h-48 w-full rounded-xl bg-cinza object-contain"
                    />
                )}
            </div>
        </aside>
    );
}
