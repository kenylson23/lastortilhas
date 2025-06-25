# Guia de Configuração Supabase - Las Tortillas

## Configuração do Banco de Dados

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em "New Project"
3. Configure:
   - **Nome**: Las Tortillas Restaurant
   - **Database Password**: Senha forte (salve em local seguro)
   - **Região**: Escolha a mais próxima dos usuários

### 2. Obter String de Conexão

1. No dashboard do projeto, vá em **Settings** > **Database**
2. Copie a **Connection string** na seção "Connection parameters"
3. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
4. Substitua `[YOUR-PASSWORD]` pela senha definida

### 3. Configurar Variáveis de Ambiente

**Para Desenvolvimento Local (Replit):**
```bash
DATABASE_URL=postgresql://postgres:sua_senha@db.projeto_ref.supabase.co:5432/postgres
SESSION_SECRET=uma_chave_secreta_forte
```

**Para Produção (Vercel):**
No dashboard Vercel > Settings > Environment Variables:
```
DATABASE_URL = postgresql://postgres:sua_senha@db.projeto_ref.supabase.co:5432/postgres
SESSION_SECRET = uma_chave_secreta_forte
NODE_ENV = production
```

### 4. Inicializar Banco de Dados

**Opção A: Script Automatizado**
```bash
node scripts/init-supabase-db.js
```

**Opção B: SQL Manual no Supabase**
1. Acesse **SQL Editor** no dashboard Supabase
2. Execute o script SQL completo disponível no arquivo

## Vantagens do Supabase

### Performance e Escalabilidade
- **Connection Pooling**: Automático via PgBouncer
- **Backup Automático**: Point-in-time recovery
- **Escalabilidade**: Vertical e horizontal automática
- **Global CDN**: Baixa latência mundial

### Recursos Adicionais
- **Dashboard Visual**: Interface gráfica para dados
- **APIs REST/GraphQL**: Geradas automaticamente
- **Real-time**: Subscriptions WebSocket nativas
- **Auth**: Sistema de autenticação integrado
- **Storage**: Bucket de arquivos nativo

### Monitoramento
- **Métricas**: CPU, Memory, Disk usage
- **Logs**: Queries, connections, errors
- **Alertas**: Email/Slack para problemas

## Configuração Otimizada

### Pool de Conexões
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,                    // Máximo 20 conexões
  idleTimeoutMillis: 30000,   // 30s timeout idle
  connectionTimeoutMillis: 2000, // 2s timeout conexão
});
```

### Políticas RLS (Row Level Security)
O Supabase oferece RLS avançado para segurança:
```sql
-- Exemplo: Usuários só veem suas próprias reservas
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations" ON reservations
  FOR SELECT USING (auth.uid() = user_id::text);
```

## Migração de Dados

### De Neon para Supabase
1. **Exportar dados**: `pg_dump` do Neon
2. **Importar**: SQL Editor do Supabase
3. **Verificar**: Conferir integridade dos dados

### De PostgreSQL local
```bash
# Backup local
pg_dump postgres://local_url > backup.sql

# Restore no Supabase
psql "postgresql://postgres:senha@db.ref.supabase.co:5432/postgres" < backup.sql
```

## Desenvolvimento

### Ambiente Local
- **Supabase CLI**: Para desenvolvimento local
- **Docker**: Container PostgreSQL compatível
- **Seeds**: Scripts de dados de teste

### Testing
```bash
# Testar conexão
node -e "
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(r => console.log('✅ Conectado:', r.rows[0]));
"
```

## Troubleshooting

### Problemas Comuns
- **SSL Error**: Adicionar `?sslmode=require` na URL
- **Connection Timeout**: Verificar firewall/região
- **Pool Exhausted**: Aumentar `max` connections

### Logs Úteis
```javascript
// Habilitar logs de query
const db = drizzle(pool, { 
  schema,
  logger: true  // Mostra todas as queries SQL
});
```

## Backup e Segurança

### Backup Automático
- **Point-in-time**: Até 7 dias (plano gratuito)
- **Daily backups**: Retenção configurável
- **Manual backup**: Via dashboard ou CLI

### Segurança
- **Criptografia**: AES-256 em repouso
- **SSL/TLS**: Criptografia em trânsito
- **Audit Logs**: Rastreamento de acesso
- **IP Allowlisting**: Controle de acesso por IP

## Custos e Limites

### Plano Gratuito
- **Database**: 500MB
- **Bandwidth**: 2GB/mês
- **Conexões**: 60 simultâneas
- **Backup**: 7 dias

### Upgrade Path
- **Pro**: $25/mês por projeto
- **Team**: $599/mês para equipes
- **Enterprise**: Customizado

## Credenciais de Acesso

Após inicialização:
- **Admin**: `admin` / `admin123`
- **Alterar senha**: Via painel administrativo