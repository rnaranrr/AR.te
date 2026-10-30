import FeedList from '@/components/feed/FeedList';

// Aba "Seguindo": somente posts de quem o usuário logado segue
export default function FeedFollowing() {
    return <FeedList feed="following" />;
}
