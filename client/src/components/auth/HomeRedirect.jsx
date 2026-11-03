// Componente: rota inicial (/) e rotas desconhecidas; envia cada pessoa para a tela certa
import { Navigate } from 'react-router-dom';

import { isLoggedIn, isModerator } from '@/services/api';

// Usuário logado vai para o feed; moderador (sem login de usuário) vai para a moderação; visitante vai para o login
export default function HomeRedirect() {
    if (isLoggedIn()) return <Navigate to="/feed" replace />;
    if (isModerator()) return <Navigate to="/mod" replace />;

    return <Navigate to="/login" replace />;
}
