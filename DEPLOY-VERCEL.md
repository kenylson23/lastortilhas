# Deploy no Vercel - Las Tortillas

## Configuração Completa

O projeto está configurado para deploy automático no Vercel com todos os arquivos necessários.

### Arquivos de Deploy Criados

- ✅ `vercel.json` - Configuração principal do Vercel
- ✅ `api/index.js` - Função serverless para todas as rotas da API
- ✅ `package-vercel.json` - Package.json otimizado para deploy
- ✅ `build-simple.js` - Script de build otimizado
- ✅ `.vercelignore` - Arquivos a serem ignorados
- ✅ `vite.config.minimal.ts` - Configuração Vite otimizada

### Como Fazer o Deploy

```bash
# Método 1: Deploy direto via CLI
vercel --prod

# Método 2: Conectar repositório no painel do Vercel (recomendado)
```

### Variáveis de Ambiente

Configure no painel do Vercel:

```
DATABASE_URL=sua_string_de_conexao_postgresql
SESSION_SECRET=sua_chave_secreta_segura
```

### Processo de Build

1. **Backend**: esbuild empacota `server/index.ts` para `dist/index.js`
2. **Frontend**: Build otimizado ou fallback HTML se houver timeout
3. **API**: Função serverless gerencia todas as rotas `/api/*`
4. **Static**: SPA routing com fallback para `index.html`

### Funcionalidades

- ✅ Sistema de autenticação completo
- ✅ Painel administrativo
- ✅ Gerenciamento de menu e categorias  
- ✅ Sistema de reservas
- ✅ Galeria de imagens
- ✅ Upload de arquivos
- ✅ Interface responsiva

### Pós-Deploy

1. **Migração de BD**: Execute `npx drizzle-kit push` no ambiente de produção
2. **Admin User**: Crie usuário administrador
3. **Teste**: Verifique todas as funcionalidades

### Estrutura de Produção

```
Vercel Deploy:
├── api/index.js          → Todas as rotas /api/*
├── client/dist/          → Frontend estático
├── dist/index.js         → Backend empacotado
└── uploads/              → Arquivos enviados
```

O projeto está pronto para deploy imediato no Vercel!