# Deploy Las Tortillas no Vercel

## Configuração Final

✅ **Configuração única**: `vercel.json` otimizado
✅ **Sem conflitos**: builds/functions separados corretamente
✅ **Script automático**: `vercel-build` configurado
✅ **Função serverless**: `api/index.js` simplificada

## Como fazer o deploy

```bash
# 1. Deploy direto
vercel --prod

# 2. Ou conecte seu repositório no painel do Vercel
```

## Configuração do vercel.json

- **builds**: Define como construir frontend e backend
- **routes**: Roteamento SPA com fallback para index.html
- **maxDuration**: 30 segundos para a função serverless
- **filesystem**: Serve arquivos estáticos antes do fallback
- **env**: NODE_ENV=production

## Variáveis de ambiente necessárias

No painel do Vercel, configure:
- `DATABASE_URL`: String de conexão PostgreSQL

## Pós-deploy

1. Execute migração: `npm run db:push`
2. Crie usuário admin usando o script fornecido
3. Teste todas as funcionalidades

O projeto está pronto para produção no Vercel.