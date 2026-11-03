// Página: login de moderador com identificador e chave de acesso
import { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { apiError } from '@/services/api';

import '@/components/form/forms.css';
import LangBtn from '@/components/lang/Lang-btn';
import Logo from '@/assets/logo/icon-logo-big.svg?react';

// Envia identificador e chave de acesso para a API e guarda o token de moderador
export default function ModLogin() {
    const { t } = useTranslation();
    // Navega para outra tela sem recarregar a página
    const navigate = useNavigate();
    // Tela que o moderador tentou abrir antes do login (se houver); senão, a moderação
    const location = useLocation();
    const from = location.state?.from;
    const destination = from ? `${from.pathname}${from.search ?? ''}` : '/mod';

    // Campos do formulário, mensagem de erro e controle do envio
    const [formData, setFormData] = useState({
        idname: '',
        access_key: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Atualiza os dados do formulário quando o usuário digita
    const handleChange = (e) => {
        setFormData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
    };

    // Manipula o envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/mod/login', formData);

            // O token de moderador fica separado do token de usuário
            localStorage.setItem('modToken', response.data.token);
            localStorage.setItem('moderator', JSON.stringify(response.data.moderator));

            navigate(destination, { replace: true });
        } catch (err) {
            setError(apiError(err, t('mod.login_error')));
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside className="flex justify-center items-center h-dvh bg-fundo w-full font-principal p-4">
            {/* Botões de idioma */}
            <LangBtn />
            <div className="card align-self-center my-auto w-full max-w-md bg-fundo p-6 flex flex-col items-center">
                {/* Logo */}
                <Logo className='w-40 h-40 border-4 mt-6 border-texto rounded-2xl' />

                {/* Título da tela */}
                <h1 className='font-bold text-lg mt-6'>{t('mod.login_title')}</h1>

                <div className="w-full mt-4">
                    {/* Formulário de login de moderador */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Campo de identificador */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="mod-idname">{t('mod.idname')}</label>
                            <input
                                id="mod-idname"
                                type="text"
                                name="idname"
                                placeholder={t('mod.idname_placeholder')}
                                value={formData.idname}
                                onChange={handleChange}
                                maxLength={30}
                                required
                                className="inputform"
                            />
                        </fieldset>

                        {/* Campo de chave de acesso */}
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="mod-access-key">{t('mod.access_key')}</label>
                            <input
                                id="mod-access-key"
                                type="password"
                                name="access_key"
                                autoComplete="current-password"
                                placeholder={t('mod.access_key_placeholder')}
                                value={formData.access_key}
                                onChange={handleChange}
                                required
                                className="inputform"
                            />
                        </fieldset>

                        {/* Mensagem de erro do login */}
                        {error && <p role="alert" className="text-destaque text-sm">{error}</p>}

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {/* Botão de entrar */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                            >
                                {loading ? t('mod.logging') : t('mod.login_button')}
                            </button>

                            {/* Botão para voltar ao site */}
                            <NavLink
                                to="/feed"
                                className="btn text-cinza font-normal bg-fundo hover:bg-destaque/50 border-2 border-destaque rounded-full mt-2 w-full"
                            >
                                {t('mod.back')}
                            </NavLink>
                        </div>
                    </form>
                </div>
            </div>
        </aside>
    );
}
