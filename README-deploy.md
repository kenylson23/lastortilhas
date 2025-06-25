# Las Tortillas - Guia de Deploy no Vercel

## Preparação para Deploy

Este projeto está configurado para deploy no Vercel com as seguintes configurações:

### Arquivos de Deploy
- `vercel.json` - Configuração do Vercel
- `api/index.js` - Ponto de entrada serverless
- `.env.example` - Variáveis de ambiente necessárias

### Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel do Vercel:

```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret_key
```

### Banco de Dados

1. **PostgreSQL**: Use um serviço como Neon, Supabase ou Railway
2. **Schema**: Execute `npm run db:push` para criar as tabelas
3. **Admin User**: Execute o script de criação do usuário admin após o deploy

### Comandos de Deploy

```bash
# Instalar dependências
npm install

# Build do projeto
npm run build

# Deploy no Vercel
vercel --prod
```

### Possíveis Conflitos de Build

**Problema 1: Timeout no build**
- Solução: O build pode demorar devido aos ícones do lucide-react
- Use `vercel-simple.json` se houver problemas

**Problema 2: Serverless vs HTTP Server**
- O código detecta automaticamente ambiente Vercel
- Retorna Express app em vez de HTTP server

**Problema 3: Upload de arquivos**
- No Vercel, uploads são temporários
- Para produção, configure Cloudinary ou AWS S3

### Estrutura de Pastas para Deploy

```
├── api/
│   └── index.js          # Serverless function
├── client/
│   └── dist/             # Frontend buildado
├── server/               # Backend source
├── shared/               # Schemas compartilhados
├── vercel.json           # Configuração Vercel
└── package.json          # Dependencies
```

### Funcionalidades Incluídas

- ✅ Sistema de autenticação completo
- ✅ Gerenciamento de menu (categorias e itens)
- ✅ Sistema de reservas
- ✅ Galeria de imagens (apenas imagens, sem vídeos)
- ✅ Painel administrativo
- ✅ Upload de arquivos
- ✅ Interface responsiva

### Credenciais Admin Padrão

Após o deploy, criar usuário admin:
- Username: admin
- Password: admin123

### Configurações de Produção

O projeto está otimizado para produção com:
- Build otimizado do Vite
- Bundle do servidor com esbuild
- Configuração de sessões seguras
- Middleware de autenticação
- Tratamento de erros