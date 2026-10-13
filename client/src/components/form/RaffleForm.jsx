import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import '@/components/form/forms.css';

export default function RaffleForm() {
    const { t } = useTranslation();

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        raffle_title: '',
        raffle_content: ''
    });

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError('');
        setSuccess('');
    }

    function handleSubmit(event) {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (!formData.raffle_title.trim()) {
            setError(t('raffleform.title_required'));
            return;
        }

        if (formData.raffle_title.length > 100) {
            setError(t('raffleform.title_too_long'));
            return;
        }

        // O cadastro ainda não possui uma rota disponível no servidor.
        setSuccess(t('raffleform.success'));
    }

    return (
        <aside className="flex bg-fundo w-full font-principal justify-center">
            <div className="card w-full max-w-md bg-fundo flex justify-start items-start flex-col pb-6">
                <div className="w-full">
                    <form
                        onSubmit={handleSubmit}
                        className="mx-4 flex flex-col gap-4"
                        noValidate
                    >
                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="raffle-title">
                                {t('raffleform.title')}
                            </label>

                            <input
                                id="raffle-title"
                                name="raffle_title"
                                type="text"
                                value={formData.raffle_title}
                                onChange={handleChange}
                                maxLength={100}
                                className="inputform"
                            />

                            <span className="text-right text-sm text-cinza">
                                {formData.raffle_title.length}/100
                            </span>
                        </fieldset>

                        <fieldset className="fieldset inputlabel">
                            <label htmlFor="raffle-content">
                                {t('raffleform.content')}
                            </label>

                            <textarea
                                id="raffle-content"
                                name="raffle_content"
                                value={formData.raffle_content}
                                onChange={handleChange}
                                className="areaformprofile"
                            />
                        </fieldset>

                        {error && (
                            <p role="alert" className="text-sm text-red-500">
                                {error}
                            </p>
                        )}

                        {success && (
                            <p role="status" className="text-sm text-green-500">
                                {success}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn mt-2 w-full rounded-full border-none bg-destaque font-bold text-fundo hover:bg-destaque/90"
                        >
                            {t('raffleform.save')}
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}