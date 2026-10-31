// Serviço: cliente HTTP (axios) da API e funções auxiliares
import axios from 'axios';

// URL base da API (definida no .env do client: VITE_API_URL=http://localhost:3000)
const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// Cliente axios com a URL base da API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

// Antes de cada requisição, envia o token de login (se existir)
api.interceptors.request.use((config) => {
  // Adiciona o token de autenticação ao cabeçalho da requisição
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o servidor responder 401 para quem tinha token, a sessão expirou:
// limpa os dados locais e volta para o login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = Boolean(localStorage.getItem('token'));

    if (error.response?.status === 401 && hadToken && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Converte um caminho relativo do servidor (ex.: "/uploads/posts/a.png") em URL completa
// URLs absolutas (http, blob, data) são devolvidas sem alteração
export function assetUrl(path) {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Extrai a mensagem de erro enviada pela API ({ error: '...' }), ou usa um texto padrão
export function apiError(err, fallback) {
  return err?.response?.data?.error || fallback;
}

// Usuário logado salvo no login (ou null)
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// True se existe um token salvo
export function isLoggedIn() {
  return Boolean(localStorage.getItem('token'));
}

export default api;
