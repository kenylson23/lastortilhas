# Guia de Deploy Vercel - Las Tortillas

## Pré-requisitos

1. **Conta no Vercel**: Criar conta em [vercel.com](https://vercel.com)
2. **Database Supabase**: Database PostgreSQL já configurado no Supabase
3. **Repositório Git**: Projeto commitado no GitHub/GitLab

## Passos para Deploy

### 1. Database Supabase (Já Configurado)

O database Supabase já está configurado e funcionando. Use esta `DATABASE_URL` no Vercel:
```
postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 2. Deploy no Vercel

**Opção A: Via CLI**
```bash
npm install -g vercel
vercel --prod
```

**Opção B: Via Dashboard**
1. Acessar [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clicar em "New Project"
3. Importar repositório do GitHub
4. Configurar variáveis de ambiente

### 3. Configurar Variáveis de Ambiente

No Dashboard Vercel > Settings > Environment Variables:

```
DATABASE_URL = postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SESSION_SECRET = las_tortillas_production_secret_2025
NODE_ENV = production
```

### 4. Primeira Execução - Inicializar Database

Após o deploy ser concluído, executar uma única vez para criar as tabelas e dados iniciais:

1. Acessar o dashboard do Vercel
2. Ir em Functions > api/index.js
3. Executar o script de inicialização:

```bash
node scripts/init-vercel-db.js
```

Ou usar a API diretamente:
```bash
curl -X POST https://seu-projeto.vercel.app/api/init-db
```

### 5. Verificação

Testar os endpoints principais:
- `https://seu-projeto.vercel.app/` - Frontend
- `https://seu-projeto.vercel.app/api` - API health check
- `https://seu-projeto.vercel.app/api/menu/categories` - Categorias
- `https://seu-projeto.vercel.app/api/menu/items` - Menu

## Credenciais de Acesso

- **Admin**: `admin` / `admin123`
- **Alterar senha**: Acesse o painel administrativo após primeiro login

## Funcionalidades Disponíveis

- ✅ Sistema completo de autenticação
- ✅ Gestão de menu e categorias
- ✅ Sistema de reservas
- ✅ Galeria de imagens
- ✅ Painel administrativo
- ✅ Design responsivo

## Arquitetura Serverless

- **Frontend**: Servido estaticamente pelo Vercel
- **Backend**: Função serverless em `/api/index.js`
- **Database**: PostgreSQL no Neon (serverless)
- **Sessões**: Memory store (adequado para serverless)
- **Uploads**: Sistema de arquivos local (Vercel)

## Monitoramento

- **Logs**: Dashboard Vercel > Functions
- **Métricas**: Dashboard Vercel > Analytics
- **Database**: Dashboard Neon para monitoramento

## Troubleshooting

### Deploy Falha
- Verificar logs no dashboard Vercel
- Confirmar variáveis de ambiente
- Testar DATABASE_URL localmente

### API Não Responde
- Verificar função serverless está ativa
- Confirmar rotas em vercel.json
- Testar endpoints individuais

### Database Erro
- Verificar DATABASE_URL válida
- Confirmar Neon database está ativo
- Executar scripts de inicialização

## Manutenção

### Atualizações
```bash
git add .
git commit -m "Update"
git push
# Deploy automático via Vercel
```

### Backup Database
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Logs de Acesso
Acessar via Dashboard Vercel > Functions > Logs