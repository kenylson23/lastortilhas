# Troubleshooting Deploy Vercel - Las Tortillas

## Problemas Identificados e Soluções

### ❌ Problema 1: Build Timeout
**Sintoma**: Build do frontend demora muito ou trava
**Causa**: Vite build muito lento com muitas dependências
**Solução**: Usar configuração otimizada

### ❌ Problema 2: Conflitos de Configuração
**Sintoma**: Erro "builds" e "functions" simultaneamente
**Causa**: vercel.json mal configurado
**Solução**: Usar apenas uma abordagem

### ❌ Problema 3: Estrutura de Pastas
**Sintoma**: Vercel não encontra arquivos
**Causa**: Estrutura monorepo complexa
**Solução**: Simplificar estrutura

## ✅ Soluções Implementadas

### Configuração Final Recomendada

Usar o arquivo `vercel-simple.json` (renomear para `vercel.json`):

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Passos para Deploy Sem Problemas

1. **Usar configuração simples**:
   ```bash
   cp vercel-simple.json vercel.json
   ```

2. **Variáveis de ambiente no Vercel**:
   ```
   DATABASE_URL = postgresql://postgres.nuoblhgwtxyrafbyxjkw:Kenylson%4023@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   SESSION_SECRET = las_tortillas_production_secret_2025
   NODE_ENV = production
   ```

3. **Deploy via GitHub + Vercel Dashboard**:
   - Conectar repositório no Vercel
   - Configurar variáveis
   - Deploy automático

### Arquivos Importantes

- `api/index.js` - Backend serverless pronto
- `client/package.json` - Frontend com build configurado
- `vercel-simple.json` - Configuração testada
- `.nvmrc` - Node.js 18

### Fallback: Deploy Manual

Se ainda houver problemas, usar:

```bash
# Build local
cd client && npm run build

# Deploy via CLI
npm install -g vercel
vercel --prod
```

## Status: PRONTO PARA DEPLOY

Todas as configurações foram testadas e otimizadas para funcionar no Vercel.