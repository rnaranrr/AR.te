// Página: aba "Portfólio" do perfil (grade com as mídias dos posts)
import { NavLink } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';

import { assetUrl } from '@/services/api';

// A aba mostra somente posts que possuem mídia
export default function Media({ posts = [] }) {
    const postsWithMedia = posts.filter(
        (post) => Array.isArray(post.media) && post.media.length > 0
    );

    return (
        <section className="w-full min-h-dvh bg-fundo text-texto-main px-3 py-5">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    {postsWithMedia.map((post) => {
                        const firstMedia = post.media[0];
                        const extraMediaCount = post.media.length - 1;
                        // Vídeos usam a tag <video>; as demais mídias, <img>
                        const isVideo = (firstMedia.media_type || '').toLowerCase().startsWith('video');

                        // Conteúdo sensível fica desfocado na grade do portfólio
                        const mediaClass = `w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${post.is_nsfw ? 'blur-xl' : ''}`;

                        return (
                            <NavLink
                                key={post.post_id}
                                to={`/post/${post.post_id}`}
                                aria-label={`Ver publicação: ${post.post_title}${extraMediaCount > 0
                                        ? `, mais ${extraMediaCount} mídias anexadas`
                                        : ''
                                    }`}
                                className="group relative aspect-square overflow-hidden rounded-xl bg-cinza focus:outline-none focus:ring-2 focus:ring-destaque"
                            >
                                {isVideo ? (
                                    <video
                                        src={assetUrl(firstMedia.media_url)}
                                        preload="metadata"
                                        muted
                                        playsInline
                                        className={mediaClass}
                                    />
                                ) : (
                                    <img
                                        src={assetUrl(firstMedia.media_url)}
                                        alt={post.post_title}
                                        loading="lazy"
                                        className={mediaClass}
                                    />
                                )}

                                {extraMediaCount > 0 && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-cinza px-2.5 py-1 text-xs font-semibold text-[#f1f1e7] shadow">
                                        <ImageIcon size={14} />
                                        +{extraMediaCount}
                                    </div>
                                )}

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                                    <p className="text-white text-sm font-medium">
                                        {post.post_title}
                                    </p>
                                </div>
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
