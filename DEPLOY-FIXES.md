# Correções para Deploy Vercel

## Problemas Identificados e Corrigidos

### 1. Configuração WebSocket/Neon
**Problema**: WebSocket não disponível no ambiente serverless
**Solução**: Configuração condicional baseada em `process.env.VERCEL`

### 2. Tabelas Não Existem
**Problema**: `relation "menu_categories" does not exist`
**Solução**: Script de inicialização `scripts/init-vercel-db.js`

### 3. Imports Externos
**Problema**: Dependências não bundled causando erros
**Solução**: Externais adicionados no esbuild: `fs-extra`, `multer`

### 4. Logs de Debug
**Problema**: Falta de visibilidade nos erros
**Solução**: Logs aprimorados na função serverless

## Pós-Deploy - Passos Necessários

1. **Migração do Banco**:
   ```bash
   npx drizzle-kit push
   ```

2. **Inicialização**:
   ```bash
   node scripts/init-vercel-db.js
   ```

3. **Variáveis de Ambiente** (Vercel Dashboard):
   ```
   DATABASE_URL=postgresql://...
   SESSION_SECRET=your-secret-key
   ```

## Arquivos Atualizados

- `server/db.ts` - WebSocket condicional
- `api/index.js` - Logs e ordem de inicialização
- `build-simple.js` - Externais adicionados
- `scripts/init-vercel-db.js` - Script de inicialização

Deploy agora deve funcionar corretamente no Vercel.