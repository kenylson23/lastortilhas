# Las Tortillas - Deploy no Vercel

## Configuração para Deploy

Este projeto está configurado para deploy automático no Vercel com as seguintes configurações:

### Arquivos de Deploy
- `vercel.json` - Configuração do Vercel
- `api/index.js` - Função serverless principal
- `package-vercel.json` - Dependências para o Vercel
- `.vercelignore` - Arquivos a serem ignorados no deploy

### Variáveis de Ambiente Necessárias

Configure no painel do Vercel:

```
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret_key
```

### Comandos de Deploy

```bash
# Deploy direto
vercel --prod

# Ou conecte o repositório no painel do Vercel para deploy automático
```

### Como Funciona

1. **Build Process**: O Vercel executa `npm run vercel-build`
2. **Frontend**: Vite constrói o React app para `client/dist`
3. **Backend**: esbuild empacota o servidor para `dist/index.js`
4. **Serverless**: A função `api/index.js` gerencia todas as rotas da API

### Pós-Deploy

1. Execute as migrações do banco de dados:
   ```bash
   npx drizzle-kit push
   ```

2. Crie um usuário administrador usando o script disponível

3. Teste as funcionalidades principais:
   - Sistema de autenticação
   - Painel administrativo
   - Upload de imagens
   - Sistema de reservas

### Funcionalidades Incluídas

- ✅ Sistema de autenticação completo
- ✅ Gerenciamento de menu (categorias e itens)
- ✅ Sistema de reservas
- ✅ Galeria de imagens
- ✅ Painel administrativo
- ✅ Upload de arquivos
- ✅ Interface responsiva
- ✅ Configuração serverless otimizada

### Estrutura de Deploy

```
├── api/
│   └── index.js          # Função serverless
├── client/
│   └── dist/             # Frontend construído
├── dist/
│   └── index.js          # Backend empacotado
├── vercel.json           # Configuração do Vercel
└── package-vercel.json   # Dependências
```

### Credenciais Admin Padrão

Após o deploy, crie um usuário admin com as credenciais de sua escolha usando o script de criação de administrador.

O projeto está otimizado para produção e pronto para deploy no Vercel.