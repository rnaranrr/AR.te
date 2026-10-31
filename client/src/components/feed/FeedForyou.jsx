// Componente: aba "Para você" (todos os posts)
import FeedList from '@/components/feed/FeedList';

// Aba "Para você": todos os posts, do mais recente para o mais antigo
export default function FeedForyou() {
    return <FeedList feed="foryou" />;
}
