# Solução para Problema de Conexão Supabase

## Problema Identificado
O endereço `db.nuoblhgwtxyrafbyxjkw.supabase.co` não está respondendo, indicando que:

1. **Projeto pausado por inatividade** (mais provável)
2. **URL incorreta ou projeto deletado**
3. **Problemas temporários de conectividade**

## Solução Imediata

### Opção 1: Reativar Projeto Existente
1. Acesse: https://supabase.com/dashboard/projects
2. Localize o projeto "las-tortillas" ou similar
3. Se estiver pausado, clique em "Resume/Unpause"
4. Aguarde alguns minutos para reativação
5. Teste a conexão novamente

### Opção 2: Obter Nova URL
1. No painel do projeto ativo
2. Clique em "Settings" → "Database"
3. Copie a nova "Connection string"
4. Formate como: `postgresql://postgres:SuaSenha@novo-host:5432/postgres`

### Opção 3: Criar Novo Projeto
1. Clique em "New project"
2. Nome: "las-tortillas-restaurant"
3. Senha: (escolha uma forte)
4. Região: South America (Brazil)
5. Aguarde criação (2-5 minutos)
6. Obtenha a nova URL de conexão

## URL Correta Esperada
Depois de reativar/criar, a URL deve ser parecida com:
```
postgresql://postgres:SuaSenha@db.xxxxxxxxxxxxxxx.supabase.co:5432/postgres
```

## Verificação Rápida
Para testar se a URL está funcionando:
1. Abra o SQL Editor no painel Supabase
2. Execute: `SELECT NOW();`
3. Se funcionar, a URL está correta

## Próximos Passos
Após obter a URL funcionando:
1. Forneça a nova URL
2. A migração completa será executada automaticamente
3. Todos os dados serão transferidos para o Supabase