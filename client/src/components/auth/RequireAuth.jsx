// Componente: protege rotas que exigem login (visitantes são enviados para a tela de login)
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { isLoggedIn, isModerator } from '@/services/api';

// Quem pode abrir as rotas filhas:
// access = 'user' (usuário logado), 'moderator' (moderador logado) ou 'any' (usuário ou moderador)
export default function RequireAuth({ access = 'user' }) {
    // Caminho atual da URL (guardado para voltar a ele depois do login)
    const location = useLocation();

    const allowed = access === 'moderator'
        ? isModerator()
        : access === 'any'
            ? isLoggedIn() || isModerator()
            : isLoggedIn();

    if (!allowed) {
        // Moderadores têm login próprio; os demais casos usam o login de usuário
        const loginPath = access === 'moderator' ? '/mod/login' : '/login';

        return <Navigate to={loginPath} replace state={{ from: location }} />;
    }

    return <Outlet />;
}
