# Guia Deploy Vercel - Las Tortillas

## Status: Pronto para Deploy

### Problemas Resolvidos
- ✅ @rollup/rollup-linux erro corrigido
- ✅ Schema database sincronizado 
- ✅ Build otimizado para não travar
- ✅ APIs funcionando localmente

### Passos para Deploy

1. **Deploy no Vercel**
   ```bash
   # No terminal local ou conecte GitHub
   vercel --prod
   ```

2. **Configurar Variáveis de Ambiente**
   No dashboard Vercel > Settings > Environment Variables:
   ```
   DATABASE_URL = sua_neon_database_url
   SESSION_SECRET = uma_chave_secreta_forte
   ```

3. **Pós-Deploy - Executar Uma Vez**
   ```bash
   # Acessar Functions tab no Vercel
   # Executar: node scripts/init-vercel-db.js
   ```

### Arquivos Críticos
- `vercel.json` - Configuração Vercel otimizada
- `api/index.js` - Função serverless principal  
- `build-minimal.js` - Build que evita travamentos
- `client/dist/` - Frontend build pronto

### Troubleshooting
Se o deploy travar:
1. Cancelar deploy atual
2. Verificar logs no dashboard
3. Re-deploy com configuração limpa

### Database Schema Ready
```sql
✅ users (5 colunas)
✅ menu_categories (5 colunas) 
✅ menu_items (12 colunas)
✅ gallery_items (7 colunas)
✅ reservations (11 colunas)
```

Dados de exemplo já inseridos e testados.