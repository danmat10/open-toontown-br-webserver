# Open Toontown BR Webserver

Este é o servidor web para o projeto Open Toontown BR. Ele fornece várias rotas para gerenciar contas e autenticação.

## Configuração

### Pré-requisitos

- Node.js
- npm
- pm2 (opcional, para gerenciamento de processos em produção)

### Instalação

1. Clone o repositório:

    ```sh
    git clone https://github.com/seu-usuario/open-toontown-br-webserver.git
    cd open-toontown-br-webserver
    ```

2. Instale as dependências:

    ```sh
    npm install
    ```

3. Crie um arquivo `.env` na raiz do projeto e defina as variáveis de ambiente necessárias:

    ```env
    PORT=80
    USER_DB_PATH=/caminho/para/o/banco/de/dados
    NODE_ENV=production_or_development
    ##production_uses_mongo
    MONGODB_URI=
    ##development_uses_yaml
    YAML_DIR=
    JWT_SECRET=your_jwt_secret
    ```

### Executando o servidor

Para iniciar o servidor em modo, execute:

```sh
npm start
```

### Rotas

1. Astron Routes
GET /account: Obtém informações da conta Astron.

2. Auth Routes
POST /login: Faz login de um usuário.
POST /validate-token: Valida um token de autenticação.
POST /signup: Registra um novo usuário.
