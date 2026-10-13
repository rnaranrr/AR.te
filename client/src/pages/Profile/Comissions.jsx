import { useTranslation } from 'react-i18next';

export default function Comissions({ user }) {
    const { t } = useTranslation();

    return (
        <aside className="min-h-dvh w-full bg-fundo px-3 py-5 text-texto-main">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-4">

                <div className="flex items-center justify-between py-4">
                    <span className="text-sm font-semibold">
                        {t('profile.commissions_status')}
                    </span>

                    <span
                        className={`badge ${user.commissions_open
                                ? 'badge-success'
                                : 'badge-error'
                            }`}
                    >
                        {user.commissions_open
                            ? t('profile.commissions_open')
                            : t('profile.commissions_closed')}
                    </span>
                </div>

                <div aria-label={t('profileform.commissions_banner_label')}>
                    {user.commissions_banner_url ? (
                        <img
                            src={new URL(user.commissions_banner_url, import.meta.env.VITE_API_URL).href}
                            alt={t('profileform.commissions_banner_label')}
                            className="h-40 w-full rounded-xl bg-cinza object-cover sm:h-48"
                        />
                    ) : (
                        <div className="flex h-40 items-center justify-center rounded-xl bg-discreto text-sm text-texto-main sm:h-48">
                            {t('profile.commissions_banner_empty')}
                        </div>
                    )}
                </div>

                <div aria-label={t('profileform.commissions_image_label')}>
                    {user.commissions_image_url ? (
                        <img
                            src={new URL(user.commissions_image_url, import.meta.env.VITE_API_URL).href}
                            alt={t('profileform.commissions_image_label')}
                            className="max-h-[70dvh] min-h-48 w-full rounded-xl bg-cinza object-contain"
                        />
                    ) : (
                        <div className="flex min-h-48 items-center justify-center rounded-xl bg-discreto text-sm text-texto-main">
                            {t('profile.commissions_image_empty')}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
