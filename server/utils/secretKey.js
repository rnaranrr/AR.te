// Utilitário: leitura e validação da SECRET_KEY usada para assinar e validar os tokens JWT
// Não existe valor padrão: sem uma chave válida no arquivo .env o servidor não inicia

// Tamanho mínimo aceito (caracteres)
const MIN_LENGTH = 32;

// Trechos que indicam uma chave de exemplo ou o antigo valor padrão do código (nunca aceitos)
const FORBIDDEN_PARTS = ['chave_secreta_padrao', 'troque', 'changeme', 'sua_chave', 'secret_key'];

// Comando que gera uma chave aleatória adequada
const GENERATE_COMMAND = `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`;

// Devolve a SECRET_KEY válida ou lança um erro explicando o que corrigir
export function getSecretKey() {
    const key = process.env.SECRET_KEY;

    const problem = !key
        ? 'não foi definida'
        : key.length < MIN_LENGTH
            ? `tem apenas ${key.length} caracteres (o mínimo é ${MIN_LENGTH})`
            : FORBIDDEN_PARTS.some((part) => key.toLowerCase().includes(part))
                ? 'parece um valor de exemplo'
                : new Set(key).size < 8
                    ? 'é repetitiva demais'
                    : null;

    if (problem) {
        throw new Error(
            `SECRET_KEY inválida: ${problem}.\n` +
            `Defina no arquivo server/.env uma chave aleatória com pelo menos ${MIN_LENGTH} caracteres.\n` +
            `Para gerar uma: ${GENERATE_COMMAND}`
        );
    }

    return key;
}

// Confere a chave na inicialização do servidor (lança o mesmo erro de getSecretKey)
export function assertSecretKey() {
    getSecretKey();
}
