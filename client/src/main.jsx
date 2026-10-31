// Entrada do React: monta o App com o roteador e as traduções
import React from 'react'
import ReactDOM from 'react-dom/client'
// BrowserRouter permite trocar de tela sem recarregar a página
import { BrowserRouter } from 'react-router-dom'

import App from '@/App.jsx'
import '@/index.css'
import './i18n'

// Renderiza a aplicação dentro da div #root do index.html
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
