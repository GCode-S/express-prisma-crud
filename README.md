# Express Prisma CRUD API

Uma API REST robusta, construída com Express.js e Prisma ORM, que oferece autenticação de usuário, gerenciamento de requisições e diversas implementações de segurança.

## 🚀 Funcionalidades

- **Autenticação do usuário**
  - Autenticação baseada em JWT
  - Criptografia segura de senhas usando SHA-256
  - Cadastro e login de usuários

- **Gerenciamento de postagens**
  - Operações de Criação, Leitura, Atualização e Exclusão (CRUD)
  - Rotas protegidas para gerenciamento de postagens
  - Operações de postagem específicas do usuário

- **Recursos de segurança**
  - Limitação de taxa (60 requisições por minuto)
  - Limitação de velocidade com atrasos progressivos
  - Helmet.js para segurança do cabeçalho HTTP
  - Limitação do tamanho da requisição
  - Autenticação baseada em token

- **Database**
  - Integração com PostgreSQL via Prisma
  - Modelagem de dados eficiente
  - Gerenciamento de relacionamento entre Usuários e Postagens

## 📋 Pré-requisitos

  - Node.js (versão 14 ou superior recomendada)
  - Banco de dados PostgreSQL
  - Gerenciador de pacotes npm ou yarn

## 🛠️ Instalação

1. Clone o repositório:

```bash
git clone https://github.com/GCode-S/express-prisma-crud.git
cd express-prisma-crud
```

2. Instale as dependências:
```bash
npm install
```

3. Configurar variáveis ​​de ambiente
```env
# Create a .env file and add these variables
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
```

4. Executar migrações do Prisma
```bash
npx prisma migrate dev
```

5. Iniciar o servidor
```bash
npm run dev
```

## 🔑 API Endpoints

### Rotas de Autenticação
- `POST /auth/register` - Registra um novo usuário
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securepassword"
}
```

- `POST /auth/login` - Autentica um usuário e retorna um token JWT
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Rotas Protegidas

Todas as rotas protegidas exigem um token JWT válido no cabeçalho de Autorização:
`Authorization: Bearer <your-token>`

#### User Routes
- `GET /protected/users` - Obtenha todos os usuários
- `GET /protected/me` - Obtenha o perfil do usuário atual
- `PUT /protected/me/update` - Atualizar perfil de usuário
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

#### Rotas de Postagens
- `GET /protected/posts` - Obtenha todas as postagens
- `POST /protected/posts` - Cria uma nova postagem
```json
{
  "title": "Post Title",
  "content": "Post Content"
}
```
- `PUT /protected/posts` - Atualize uma postagem
```json
{
  "id": 1,
  "title": "Updated Title", 
  "content": "Updated Content"
}
```
- `DELETE /protected/posts` - Deleta uma postagem
```json
{
  "id": 1
}
```

## 🛡️ Recursos de segurança

### Rate Limiting
- 60 solicitações por minuto por IP
- Tratamento de erros personalizado para casos em que o limite de taxa é excedido

### Speed Limiting 
- Atraso progressivo após 30 solicitações por minuto
- Atraso de 500 ms adicionado a cada solicitação subsequente

### Request Protection
- Limite de 100 KB para payloads JSON
- Helmet.js para cabeçalhos HTTP seguros
- Verificação de token JWT

## 📚 Database Schema

### User Model
```prisma
model User {
  id       Int     @id @default(autoincrement())
  name     String
  email    String  @unique
  password String
  posts    Post[]
}
```

### Post Model
```prisma
model Post {
  id       Int     @id @default(autoincrement())
  title    String
  content  String?
  author   User    @relation(fields: [authorId], references: [id])
  authorId Int
}
```

## 📝 License

MIT License