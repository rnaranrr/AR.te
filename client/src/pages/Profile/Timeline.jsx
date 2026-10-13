import Post from '@/components/Post';
import { timelineMock } from '@/mockup/timelinemock';

export default function Timeline({ posts = [], user }) {
    const displayedPosts = posts.length > 0 ? posts : timelineMock;

    return (
        <section className="w-full min-h-dvh bg-fundo text-texto-main px-2 py-4">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
                {displayedPosts.map((post) => (
                    <Post
                        key={post.post_id}
                        author={post.author.user_id}
                        authorname={post.author.name}
                        authorusername={post.author.username}
                        authoravatar_url={post.author.avatar_url}

                        post_id={post.post_id}
                        post_title={post.post_title}
                        post_content={post.post_content}
                        createdAt={post.createdAt}

                        is_nsfw={post.is_nsfw}

                        media={post.media}

                        likesCount={post.likesCount}
                        commentsCount={post.commentsCount}
                        repostsCount={post.repostsCount}

                        tags={post.tags}
                    />
                ))}
            </div>
        </section>
    );
}
