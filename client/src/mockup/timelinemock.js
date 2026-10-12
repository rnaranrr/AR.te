export const timelineMock = [
    {
        post_id: 1,
        post_title: 'Estudo de cores',
        post_content:
            'Explorando novas combinações de cores para meu próximo projeto.',
        createdAt: '2026-10-10T14:30:00.000Z',
        is_nsfw: false,

        author: {
            user_id: 1,
            name: 'rnaranrr',
            username: 'rnaranrr',
            avatar_url:
                'https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg',
        },

        media: [
            {
                media_id: 1,
                media_url:
                    'https://images.unsplash.com/photo-1770129703548-e1ced0e4f118?q=80&w=735&auto=format&fit=crop',
                media_type: 'image',
            },
            {
                media_id: 2,
                media_url:
                    'https://plus.unsplash.com/premium_vector-1724811760472-63b7fecc61e9?q=80&w=704&auto=format&fit=crop',
                media_type: 'image',
            },
        ],

        tags: [
            { tag_id: 1, tag_name: 'arte' },
            { tag_id: 2, tag_name: 'pintura' },
        ],

        likesCount: 189,
        commentsCount: 24,
        repostsCount: 5,
    },

    {
        post_id: 2,
        post_title: 'Personagem original',
        post_content: 'Um dos meus estudos recentes de personagem.',
        createdAt: '2026-10-08T17:00:00.000Z',
        is_nsfw: false,

        author: {
            user_id: 1,
            name: 'rnaranrr',
            username: 'rnaranrr',
            avatar_url:
                'https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg',
        },

        media: [
            {
                media_id: 3,
                media_url:
                    'https://images.unsplash.com/vector-1742996363326-7a2fb198a63d?q=80&w=764&auto=format&fit=crop',
                media_type: 'image',
            },
        ],

        tags: [{ tag_id: 3, tag_name: 'ilustração' }],

        likesCount: 92,
        commentsCount: 12,
        repostsCount: 3,
    },

    {
        post_id: 3,
        post_title: 'Processo criativo',
        post_content: 'Pensando sobre meu processo criativo e as referências que inspiram meus trabalhos.',
        createdAt: '2026-10-05T12:00:00.000Z',
        is_nsfw: false,

        author: {
            user_id: 1,
            name: 'rnaranrr',
            username: 'rnaranrr',
            avatar_url:
                'https://pbs.twimg.com/profile_images/2021635657391575041/1M2qZobz_400x400.jpg',
        },

        media: [],

        tags: [{ tag_id: 4, tag_name: 'processocriativo' }],

        likesCount: 47,
        commentsCount: 8,
        repostsCount: 1,
    },
];