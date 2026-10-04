import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';

import '@/components/form/forms.css';
import LangBtn from '@/components/lang/Lang-btn';
import Logo from '@/assets/logo/icon-logo-big.svg?react';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Define as variáveis de estado para o formulário, erro e carregamento
    const [formData, setFormData] = useState({ 
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
            const response = await api.post('/auth/login', formData);

            // Armazena o token
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            navigate('/feed');
        } catch (err) {
            setError(t('login.error'));
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                        <p className='text-cinza text-sm'>{t('login.registermsg')}<NavLink to="/register" className='text-destaque'>{t('login.registermsglink')}</NavLink></p>

                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn bg-destaque text-fundo font-bold hover:bg-destaque/90 border-none rounded-full mt-2 w-full"
                            >
                                {loading ? t('login.logging') : t('login.login')}
                            </button>

                            <NavLink
                                to="/register"
                                className="btn text-cinza font-normal bg-fundo hover:bg-destaque/50 border-2 border-destaque rounded-full mt-2 w-full"
                            >
                                {t('login.register')}
                            </NavLink>

                        </div>

                    </form>
                </div>
            </div>
        </aside>
    );
}