// Componente: rola a página para o topo a cada mudança de rota
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Não exibe nada: só executa a rolagem
export default function Scroll() {
    // Caminho atual da URL
    const { pathname } = useLocation();

    // Sempre que o caminho muda, volta para o topo
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
        });
    }, [pathname]);

    return null;
}
