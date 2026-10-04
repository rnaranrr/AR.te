import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

import '@/components/form/forms.css';
import LangBtn from '@/components/lang/Lang-btn';
import Logo from '@/assets/logo/icon-logo-big.svg?react';

export default function Register() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Define as variáveis de estado para o formulário, erro e carregamento
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
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
            // Post para a rota do express
            await api.post('/auth/register', formData);

            // Após o cadastro bem-sucedido, redireciona para a página de login
            navigate('/login');
        } catch (err) {
            setError(t('login.errorregister'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside className="flex justify-center items-center h-screen bg-fundo w-full font-principal p-4">
            <LangBtn />
            <div className="card align-self-center my-auto w-full max-w-md bg-fundo p-6 flex flex-col items-center">
                <Logo className='w-40 h-40 border-4 mt-6 border-texto rounded-2xl' />

                <div className="w-full mt-6">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:gap-1">
                        <fieldset className="fieldset inputlabel">
                            <label>{t('login.nickname')}</label>
                            <input
                                type="text"
                                name="name"
                                placeholder={t('login.nickname_placeholder')}
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="inputform"
                            />
                        </fieldset>
                        <fieldset className="fieldset inputlabel">
                            <label>{t('login.username')}</label>
                            <input
                                type="text"
                                name="username"
                                placeholder={t('login.username_placeholder')}
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="inputform"
                            />
                        </fieldset>
                        <fieldset className="fieldset inputlabel">
                            <label>{t('login.email')}</label>
                            <input
                                type="email"
                                name="email"
                                placeholder={t('login.email_placeholder')}
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="inputform"
                            />
                        </fieldset>
                        <fieldset className="fieldset inputlabel">
                            <label>{t('login.password')}</label>
                            <input
                                type="password"
                                name="password"
                                placeholder={t('login.password_placeholder')}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="inputform"
                            />
                        </fieldset>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <p className='text-cinza w-full flex text-center itens-center'>{t('login.registertip')}</p>

                        <div className="grid grid-cols-1 gap-2 mt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                            >
                                {loading ? t('login.registering') : t('login.create_account')}
                            </button>
                        </div>

                        <p className='text-cinza text-sm w-full flex justify-center'>{t('login.loginmsg')}<NavLink to="/login" className='pl-1 text-destaque'>{t('login.loginmsglink')}</NavLink></p>

                    </form>
                </div>
            </div>
        </aside>
    );
}