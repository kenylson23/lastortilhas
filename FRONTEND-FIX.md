# Correção Frontend - Site Mostrando Código

## Problema Identificado
O Vercel estava servindo código JavaScript em vez da interface do restaurante.

## Causa
- Build frontend inadequado
- Rotas do vercel.json não mapeando assets corretamente

## Correções Aplicadas

1. **Build Script Corrigido (build-vercel.js)**
   - Usa vite build do projeto principal
   - Output direcionado para client/dist
   - Timeout otimizado para evitar travamentos

2. **Rotas Vercel Corrigidas**
   ```json
   {
     "routes": [
       { "src": "/api/(.*)", "dest": "/api/index.js" },
       { "src": "/assets/(.*)", "dest": "/client/dist/assets/$1" },
       { "src": "/(.*)", "dest": "/client/dist/index.html" }
     ]
   }
   ```

3. **Estrutura de Arquivos**
   - client/dist/index.html (HTML principal)
   - client/dist/assets/ (CSS e JS compilados)
   - api/index.js (função serverless)

## Resultado Esperado
Site deve carregar a interface do restaurante Las Tortillas em vez de mostrar código.