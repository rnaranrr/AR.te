import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import '@/components/form/forms.css';

export default function ProfileForm() {
    const { t } = useTranslation();

    // Controla o carregamento e o salvamento do formulário
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Armazena as mensagens de erro e sucesso
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Controla se a publicação possui conteúdo sensível
    const [isNsfw, setIsNsfw] = useState(false);

    // Mantém os campos de texto controlados pelo React
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: ''
    });

    // Armazena até quatro arquivos de mídia selecionados
    const [mediaFiles, setMediaFiles] = useState([
        null,
        null,
        null,
        null
    ]);

    // Armazena as URLs temporárias para pré-visualização das mídias
    const [mediaPreviews, setMediaPreviews] = useState([
        '',
        '',
        '',
        ''
    ]);

    // Cria as pré-visualizações sempre que os arquivos forem alterados
    useEffect(() => {
        const urls = mediaFiles.map((file) =>
            file ? URL.createObjectURL(file) : ''
        );

        setMediaPreviews(urls);

        // Libera as URLs temporárias quando as prévias forem substituídas
        // ou quando o componente for desmontado
        return () => {
            urls.forEach((url) => {
                if (url) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [mediaFiles]);

    // Atualiza o campo correspondente usando o atributo name do input
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        // Limpa mensagens antigas quando o usuário altera os campos
        setError('');
        setSuccess('');
    }

    // Valida o arquivo selecionado e atualiza a mídia correspondente
    function handleMediaChange(event, index) {
        const file = event.target.files?.[0];

        if (!file) return;

        // Formatos de mídia permitidos
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4'
        ];

        // Limite de tamanho de cada arquivo: 20 MB
        const maxSize = 20 * 1024 * 1024;

        // Verifica se o formato é permitido
        if (!allowedTypes.includes(file.type)) {
            setError(t('newpost.invalid_media_type'));

            event.target.value = '';
            return;
        }

        // Verifica se o arquivo respeita o limite de tamanho
        if (file.size > maxSize) {
            setError(t('newpost.media_too_large'));

            event.target.value = '';
            return;
        }

        // Atualiza o arquivo na posição selecionada
        setMediaFiles((previous) =>
            previous.map((currentFile, currentIndex) =>
                currentIndex === index ? file : currentFile
            )
        );

        // Limpa as mensagens anteriores
        setError('');
        setSuccess('');
    }

    // Impede o recarregamento da página e valida os dados do formulário
    function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setSuccess('');

        // Impede o envio enquanto os dados estão sendo processados
        if (saving) return;

        // Verifica se o título foi preenchido
        if (!formData.title.trim()) {
            setError(t('newpost.title_required'));
            return;
        }

        // Verifica se o título não ultrapassa 255 caracteres
        if (formData.title.length > 255) {
            setError(t('newpost.title_too_long'));
            return;
        }

        // Neste momento, o formulário está em modo de teste.
        // Nenhum dado ou arquivo é enviado ao backend.
        setSuccess(t('newpost.success'));
    }

    // Exibe uma mensagem enquanto o carregamento estiver ativo
    if (loading) {
        return (
            <aside className="w-full min-h-dvh bg-fundo text-texto-main p-6">
                {t('profile.loading')}
            </aside>
        );
    }

    return (
        <aside className="flex bg-fundo w-full font-principal justify-center">
            <div className="card w-full max-w-md bg-fundo flex justify-center flex-col pb-6">
                <div className="w-full">

                    {/* Formulário de criação de publicação */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 mx-4"
                    >
                        {/* Título da publicação */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="post-title">
                                {t('newpost.titlepost')}
                            </label>

                            <input
                                id="post-title"
                                name="title"
                                type="text"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={255}
                                className="inputform"
                                required
                            />

                            <span className="text-sm text-cinza text-right">
                                {formData.title.length}/255
                            </span>
                        </fieldset>

                        {/* Conteúdo da publicação */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="post-content">
                                {t('newpost.content')}
                            </label>

                            <textarea
                                id="post-content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                className="areaformprofile"
                                maxLength={500}
                            />

                            <span className="text-sm text-cinza text-right">
                                {formData.content.length}/500
                            </span>
                        </fieldset>

                        {/* Pré-visualização das mídias da publicação */}
                        <section>
                            <p className="font-semibold text-center mx-auto pb-4">
                                {t('newpost.adddesc')}
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                {mediaPreviews.map((preview, index) => {
                                    const mediaName = `${index + 1}`;
                                    const file = mediaFiles[index];

                                    return (
                                        <div key={mediaName}>
                                            {preview ? (
                                                file?.type.startsWith('video/') ? (
                                                    <video
                                                        src={preview}
                                                        controls
                                                        className="aspect-square w-full rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <img
                                                        src={preview}
                                                        alt={`Pré-visualização da mídia ${mediaName}`}
                                                        className="aspect-square w-full rounded-xl object-cover"
                                                    />
                                                )
                                            ) : (
                                                <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-discreto text-sm">
                                                    {t('newpost.media')} {mediaName}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Campos para selecionar os arquivos */}
                            <div className="mt-4 flex flex-col gap-2">
                                {mediaFiles.map((_, index) => {
                                    const mediaName = `${index + 1}`;

                                    return (
                                        <fieldset
                                            className="fieldset inputlabel"
                                            key={mediaName}
                                        >
                                            <label htmlFor={`media-${mediaName}`}>
                                                {t('newpost.media')} {mediaName}
                                            </label>

                                            <input
                                                id={`media-${mediaName}`}
                                                name={`media-${mediaName}`}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4"
                                                onChange={(event) =>
                                                    handleMediaChange(event, index)
                                                }
                                                className="fileform"
                                            />
                                        </fieldset>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Tags da publicação, separadas por vírgulas */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="post-tags">
                                {t('newpost.tags')}
                            </label>

                            <input
                                id="post-tags"
                                name="tags"
                                type="text"
                                value={formData.tags}
                                onChange={handleChange}
                                className="inputform"
                                placeholder={t('newpost.tagspreset')}
                            />
                        </fieldset>

                        {/* Opção para marcar conteúdo sensível (NSFW) */}
                        <label className="inputform flex flex-row gap-4">
                            <input
                                type="checkbox"
                                checked={isNsfw}
                                onChange={(event) =>
                                    setIsNsfw(event.target.checked)
                                }
                                className="mt-1 accent-destaque"
                            />

                            <span>
                                <span className="block font-semibold">
                                    {t('newpost.check')}
                                </span>
                            </span>
                        </label>

                        {/* Mensagens de erro e sucesso */}
                        {error && (
                            <p role="alert" className="text-red-500 text-sm">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p role="status" className="text-green-500 text-sm">
                                {success}
                            </p>
                        )}

                        {/* Botão de envio do formulário */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                        >
                            {saving
                                ? t('newpost.saving')
                                : t('newpost.save')}
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}