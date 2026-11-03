// Componente: telas de login e cadastro, que só fazem sentido para quem ainda não entrou
import { Navigate, Outlet } from 'react-router-dom';

import { isLoggedIn, isModerator } from '@/services/api';

// Kind = 'user' (login de usuário) ou 'moderator' (login de moderador)
// Quem já está logado é enviado para a tela inicial correspondente
export default function GuestOnly({ kind = 'user' }) {
    const logged = kind === 'moderator' ? isModerator() : isLoggedIn();

    if (logged) {
        return <Navigate to={kind === 'moderator' ? '/mod' : '/feed'} replace />;
    }

    return <Outlet />;
}
