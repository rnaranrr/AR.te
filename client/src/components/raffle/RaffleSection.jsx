// Componente: seção de participações exibida na página de um raffle
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import FeedList from '@/components/feed/FeedList';

// Aparece no lugar dos comentários:
// botão para participar (abre o formulário de post já vinculado ao raffle) e lista de participações
export default function RaffleSection({ raffleId, postId }) {
    const { t } = useTranslation();

    return (
        <section className="w-full mt-6">

            {/* Cabeçalho e botão de participação */}
            <div className="w-full px-4 mb-2">
                <div className="card w-full max-w-xl mx-auto bg-fundo flex flex-col items-center justify-center pb-4">

                    <h2 className="max-w-xl text-xl font-bold mb-1 ml-2 flex justify-left">
                        {t('raffle.participations')}
                    </h2>

                    {/* "from" permite voltar para esta página depois de publicar */}
                    <NavLink
                        to={`/post/new?raffle=${raffleId}&from=${postId}`}
                        className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-4 w-full max-w-xl"
                    >
                        {t('raffle.join')}
                    </NavLink>
                </div>
            </div>

            {/* Separador */}
            <div className="divider divider-vertical pt-4"></div>

            {/* Todas as participações do concurso (rolagem infinita) */}
            <FeedList endpoint={`/raffles/${raffleId}/posts`} emptyKey="raffle.empty" />

        </section>
    );
}
