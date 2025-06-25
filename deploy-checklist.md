# Checklist de Deploy - Las Tortillas

## Pré-Deploy

### 1. Configuração do Banco de Dados
- [ ] Criar banco PostgreSQL no Neon/Supabase/Railway
- [ ] Obter string de conexão DATABASE_URL
- [ ] Configurar variáveis de ambiente no Vercel

### 2. Build do Projeto
- [ ] `npm install` - Instalar dependências
- [ ] `npm run build` - Build frontend e backend
- [ ] Verificar se pasta `client/dist` foi criada

### 3. Deploy no Vercel
- [ ] Fazer push do código para GitHub/GitLab
- [ ] Conectar repositório ao Vercel
- [ ] Configurar variáveis de ambiente:
  - `DATABASE_URL`
  - `SESSION_SECRET`
- [ ] Deploy automático

### 4. Pós-Deploy
- [ ] Executar migrações: `npm run db:push`
- [ ] Criar usuário admin inicial
- [ ] Testar funcionalidades principais:
  - [ ] Login/logout
  - [ ] Painel admin
  - [ ] Upload de imagens
  - [ ] Criação de reservas

## Comandos Úteis

```bash
# Build local
npm run build

# Push schema para DB
npm run db:push

# Verificar tipos
npm run check
```

## Funcionalidades Prontas para Produção

- ✅ Sistema de autenticação seguro
- ✅ Gerenciamento de menu completo
- ✅ Sistema de reservas
- ✅ Galeria de imagens (upload funcional)
- ✅ Painel administrativo
- ✅ Interface responsiva
- ✅ Configuração serverless para Vercel

## Credenciais Admin

- Username: admin
- Password: admin123
- Role: admin

## Observações Importantes

1. **Uploads**: No Vercel, arquivos uploaded são temporários. Para produção, considere usar Cloudinary ou AWS S3.
2. **Sessões**: Configuradas para usar PostgreSQL como store.
3. **Segurança**: Cookies seguros habilitados em produção.
4. **Performance**: Build otimizado com Vite e esbuild.