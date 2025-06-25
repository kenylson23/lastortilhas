# Guia de Configuração do Supabase

## Passo 1: Criar Projeto no Supabase

1. Acesse: https://supabase.com/dashboard/projects
2. Clique em "New project"
3. Escolha sua organização
4. Preencha os dados:
   - **Nome do projeto**: las-tortillas-restaurant
   - **Database Password**: Crie uma senha forte (anote essa senha!)
   - **Região**: Escolha a mais próxima (ex: South America)
5. Clique em "Create new project"
6. Aguarde a criação (pode levar alguns minutos)

## Passo 2: Obter a String de Conexão

1. No painel do seu projeto, clique em "Connect" (botão verde no topo)
2. Na aba "Connection pooling", copie a URI que aparece em "Connection string"
3. A URL terá este formato:
   ```
   postgresql://postgres.xxxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
4. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você criou no Passo 1

## Passo 3: Verificar a URL

A URL correta deve:
- Começar com `postgresql://`
- Conter `supabase.com` no endereço
- Ter a porta `:6543` para connection pooling
- Não conter `[YOUR-PASSWORD]` (deve estar substituído pela senha real)

## Exemplo de URL Correta
```
postgresql://postgres.abcdefghijklmnop:MinhaSeñha123@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## Configuração no Replit

Depois de obter a URL correta:
1. Copie a URL completa
2. Forneça ela quando solicitado
3. O sistema migrará automaticamente todos os dados

## Verificação

Após configurar, você poderá:
- Ver as tabelas no painel do Supabase (SQL Editor)
- Acessar os dados através da aplicação
- Usar todas as funcionalidades do dashboard do Supabase

## Troubleshooting

**Erro "ENOTFOUND"**: URL incorreta ou projeto pausado
**Erro de autenticação**: Senha incorreta na URL
**Timeout**: Verifique se o projeto está ativo no Supabase