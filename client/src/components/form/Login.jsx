import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/api';

import '@/components/form/Login.css';
import Logo from '@/assets/logo/icon-logo-big.svg?react';

import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Define as variáveis de estado para o formulário, erro e carregamento
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 
    const handleChange = (e) => {
        setFormData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
    };

    //
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Post para a rota do express
            const response = await api.post('/auth/Login', formData);

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

    // <Logo className='sm:w-64 sm:h-64 w-40 h-40 sm:border-6 border-4 mt-6 border-texto rounded-2xl' />
    return (

    );
}