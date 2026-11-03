// Página: cadastro de novos moderadores (somente moderadores logados)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import api, { apiError, isModerator, modConfig } from '@/services/api';

import '@/components/form/forms.css';

// Cria uma conta de moderador na API, com vínculo opcional a um usuário comum
export default function ModCreate() {
    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();

    // Mensagens de erro e sucesso e controle do envio
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);

    // Campos do formulário controlados pelo React
    const [formData, setFormData] = useState({
        idname: '',
        nickname: '',
        access_key: '',
        username: ''
    });

    // Somente moderadores logados podem cadastrar outros moderadores
    useEffect(() => {
        if (!isModerator()) navigate('/mod/login');
    }, [navigate]);

    // Atualiza o campo correspondente usando o atributo name do input
    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((current) => ({ ...current, [name]: value }));
        setError('');
        setSuccess('');
    }

    // Envia os dados do novo moderador para a API
    async function handleSubmit(event) {
        event.preventDefault();

        if (saving) return;
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.post('/mod/moderators', formData, modConfig());

            setSuccess(t('mod.create_success'));
            setFormData({ idname: '', nickname: '', access_key: '', username: '' });
        } catch (err) {
            console.error('Erro ao cadastrar moderador:', err);
            setError(apiError(err, t('mod.create_error')));
        } finally {
            setSaving(false);
        }
    }

    return (
        <aside className="flex min-h-dvh bg-fundo w-full font-principal justify-center text-texto-main">
            <div className="card w-full max-w-md bg-fundo flex justify-start items-start flex-col p-6 pb-24 md:pb-6">
                {/* Título da tela */}
                <h1 className="font-bold text-lg mx-4 mb-4">{t('mod.create')}</h1>

                <div className="w-full">
                    {/* Formulário de cadastro de moderador */}
                    <form onSubmit={handleSubmit} className="mx-4 flex flex-col gap-4">
                        {/* Identificador usado no login */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="new-mod-idname">{t('mod.idname')}</label>
                            <input
                                id="new-mod-idname"
                                name="idname"
                                type="text"
                                value={formData.idname}
                                onChange={handleChange}
                                maxLength={30}
                                required
                                className="inputform"
                            />
                        </fieldset>

                        {/* Nome exibido */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="new-mod-nickname">{t('mod.create_nickname')}</label>
                            <input
                                id="new-mod-nickname"
                                name="nickname"
                                type="text"
                                value={formData.nickname}
                                onChange={handleChange}
                                maxLength={50}
                                required
                                className="inputform"
                            />
                        </fieldset>

                        {/* Chave de acesso (guardada criptografada no servidor) */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="new-mod-access-key">{t('mod.access_key')}</label>
                            <input
                                id="new-mod-access-key"
                                name="access_key"
                                type="password"
                                autoComplete="new-password"
                                value={formData.access_key}
                                onChange={handleChange}
                                minLength={8}
                                required
                                className="inputform"
                            />
                            <span className="text-sm text-cinza">{t('mod.create_key_hint')}</span>
                        </fieldset>

                        {/* Usuário comum vinculado (opcional) */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="new-mod-username">{t('mod.create_username')}</label>
                            <input
                                id="new-mod-username"
                                name="username"
                                type="text"
                                placeholder={t('mod.create_username_placeholder')}
                                value={formData.username}
                                onChange={handleChange}
                                className="inputform"
                            />
                        </fieldset>

                        {/* Mensagens de erro e sucesso */}
                        {error && <p role="alert" className="text-sm text-destaque">{error}</p>}
                        {success && <p role="status" className="text-sm text-green-500">{success}</p>}

                        {/* Botão de cadastrar */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn mt-2 w-full rounded-full border-none bg-destaque font-bold text-fundo hover:bg-destaque/90"
                        >
                            {saving ? t('mod.creating') : t('mod.create_button')}
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
