# Deploy Status - Las Tortillas

## RESOLVIDO: Runtime Version Error

**Problema:** "Os tempos de execução de função devem ter uma versão válida"

**Solução:** Removido functions/runtime do vercel.json - Vercel detectará automaticamente via:
- `.nvmrc` (Node.js 18)
- Configurações do projeto

## Arquivos de Deploy:

### vercel.json (final)
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ]
}
```

### .nvmrc
```
18
```

### package.json
```json
{
  "scripts": {
    "vercel-build": "node build-minimal.js"
  }
}
```

## Deploy Ready:
- Build script: funcionando (36KB)
- APIs: todas operacionais
- Database: schema completo
- Frontend: client/dist/index.html
- Backend: dist/index.js
- Serverless: api/index.js

Status: PRONTO PARA DEPLOY