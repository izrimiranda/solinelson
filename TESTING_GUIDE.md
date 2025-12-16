# Guia de Testes - Integração Frontend + Backend

Este guia ajuda a testar a integração completa entre o frontend React e o backend PHP com banco de dados MySQL.

---

## 🔧 Pré-requisitos

### 1. Servidor PHP Rodando
O backend PHP precisa estar acessível para o frontend. Opções:

**Opção A: PHP Built-in Server (Desenvolvimento)**
```bash
cd /caminho/para/solinelson
php -S localhost:8000
```

**Opção B: Apache/Nginx (Produção)**
- Configure o VirtualHost apontando para a pasta `solinelson`
- Garanta que a pasta `/api/` está acessível

### 2. Frontend React Rodando
```bash
cd ~/projetos/solinelson
npm run dev
```
Deve abrir em: http://localhost:3000

### 3. Atualizar URL da API (se necessário)
No arquivo `index.tsx`, linha ~52, ajuste o `API_BASE_URL`:

```typescript
// Se usando PHP built-in server:
const API_BASE_URL = 'http://localhost:8000/api';

// Se usando Apache/Nginx no servidor remoto:
const API_BASE_URL = 'https://codigo1615.com.br/solinelson/api';
```

---

## ✅ Testes de Integração

### Teste 1: Galeria Pública (Leitura)

**Objetivo**: Verificar se a página inicial carrega fotos do banco de dados.

**Passos**:
1. Acesse http://localhost:3000
2. Role a página até a seção "Galeria de Serviços"
3. Verifique se as 4 fotos iniciais aparecem (Reforma Residencial, Instalação Hidráulica, Pintura Externa, Piso Cerâmico)

**Resultado Esperado**: ✅ Fotos carregam do banco de dados via `/api/get_gallery.php`

**Verificação do Backend**:
```bash
curl http://localhost:8000/api/get_gallery.php
```
Deve retornar JSON com array de fotos.

---

### Teste 2: Criar Solicitação de Orçamento (Escrita Pública)

**Objetivo**: Verificar se formulário de contato salva no banco.

**Passos**:
1. Na página inicial, clique em "Solicitar Orçamento" (botão laranja)
2. Preencha todos os campos:
   - Nome: "João Silva Teste"
   - WhatsApp: "(31) 98765-4321"
   - Tipo de Serviço: "Hidráulica"
   - Descrição: "Vazamento no banheiro"
   - Data/Hora: Escolha qualquer data futura
   - CEP: "30110-000" (clique em "Buscar")
   - Número: "123"
   - Complemento: "Apto 301"
3. Clique em "ENVIAR SOLICITAÇÃO VIA WHATSAPP"

**Resultado Esperado**: 
- ✅ Mensagem de sucesso (nenhum erro)
- ✅ Abre WhatsApp com mensagem pré-formatada
- ✅ Registro salvo no banco

**Verificação Manual no Banco**:
```bash
php test_connection.php
```
Ou via MySQL:
```sql
SELECT * FROM budget_requests ORDER BY id DESC LIMIT 1;
```

**Verificação do Backend**:
```bash
curl -X POST http://localhost:8000/api/add_request.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste cURL",
    "phone": "(31) 99999-9999",
    "serviceType": "Outros",
    "description": "Teste via cURL",
    "date": "2024-12-01T10:00",
    "address": {
      "cep": "30000-000",
      "street": "Rua Teste",
      "number": "1",
      "complement": "",
      "neighborhood": "Centro",
      "city": "BH",
      "state": "MG"
    }
  }'
```

---

### Teste 3: Login do Admin (Autenticação)

**Objetivo**: Verificar autenticação com username e password.

**Passos**:
1. Acesse http://localhost:3000
2. Role até o rodapé
3. Clique em "Área do Admin"
4. Insira as credenciais:
   - **Username**: `admin`
   - **Senha**: `admin`
5. Clique em "Entrar"

**Resultado Esperado**: 
- ✅ Login bem-sucedido
- ✅ Redirecionado para painel administrativo
- ✅ Ver abas "Solicitações de Orçamento" e "Galeria de Fotos"

**Verificação do Backend**:
```bash
curl -X POST http://localhost:8000/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}' \
  -c cookies.txt
```
Deve retornar: `{"success": true, "message": "Login realizado com sucesso"}`

**Teste de Login Inválido**:
```bash
curl -X POST http://localhost:8000/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "errada"}'
```
Deve retornar: `{"success": false, "error": "Credenciais inválidas"}`

---

### Teste 4: Ver Solicitações (Leitura Autenticada)

**Objetivo**: Verificar se admin consegue ver todas as solicitações.

**Passos**:
1. Com login feito (Teste 3), deve estar na aba "Solicitações de Orçamento"
2. Verifique se a tabela aparece com:
   - Data
   - Cliente (Nome + WhatsApp)
   - Serviço (Tipo + Descrição)
   - Endereço completo
   - Status (botão para alternar)

**Resultado Esperado**: 
- ✅ Ver pelo menos 1 registro (o criado no Teste 2)
- ✅ Dados formatados corretamente
- ✅ Status "Pendente" com botão laranja

**Verificação do Backend**:
```bash
curl http://localhost:8000/api/get_requests.php \
  -H "Cookie: PHPSESSID=valor_do_cookie" \
  -b cookies.txt
```

---

### Teste 5: Atualizar Status de Solicitação (Escrita Autenticada)

**Objetivo**: Verificar se admin consegue mudar status de pendente → contatado.

**Passos**:
1. Na aba "Solicitações de Orçamento", localize um registro com status "Pendente"
2. Clique no botão "Pendente"

**Resultado Esperado**: 
- ✅ Status muda para "Contatado" (botão verde)
- ✅ Se clicar novamente, volta para "Pendente" (toggle)
- ✅ Mudança persiste no banco

**Verificação do Backend**:
```bash
curl -X POST http://localhost:8000/api/update_request.php \
  -H "Content-Type: application/json" \
  -H "Cookie: PHPSESSID=valor_do_cookie" \
  -b cookies.txt \
  -d '{"id": 1, "status": "contacted"}'
```

**Verificação Manual no Banco**:
```sql
SELECT id, name, status FROM budget_requests WHERE id = 1;
```

---

### Teste 6: Adicionar Foto na Galeria (Escrita Autenticada)

**Objetivo**: Verificar se admin consegue adicionar fotos.

**Passos**:
1. Clique na aba "Galeria de Fotos"
2. Na área "Adicionar Nova Foto":
   - Título: "Foto de Teste Admin"
   - URL da Imagem: `https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400`
   - Ou arraste uma imagem para o box de drag & drop
3. Clique em "Adicionar Foto"

**Resultado Esperado**: 
- ✅ Foto aparece imediatamente na lista
- ✅ Foto também visível na página inicial (seção Galeria)
- ✅ Registro salvo no banco

**Verificação do Backend**:
```bash
curl -X POST http://localhost:8000/api/add_gallery.php \
  -H "Content-Type: application/json" \
  -H "Cookie: PHPSESSID=valor_do_cookie" \
  -b cookies.txt \
  -d '{"title": "Teste cURL", "url": "https://via.placeholder.com/400"}'
```

**Verificação Manual no Banco**:
```sql
SELECT * FROM gallery_items ORDER BY id DESC LIMIT 1;
```

---

### Teste 7: Deletar Foto da Galeria (Exclusão Autenticada)

**Objetivo**: Verificar se admin consegue deletar fotos.

**Passos**:
1. Na aba "Galeria de Fotos", localize a foto "Foto de Teste Admin" (criada no Teste 6)
2. Clique no botão "Excluir" (vermelho)
3. Confirme a exclusão no popup

**Resultado Esperado**: 
- ✅ Foto desaparece da lista
- ✅ Foto também removida da página inicial
- ✅ Registro deletado do banco

**Verificação do Backend**:
```bash
curl -X POST http://localhost:8000/api/delete_gallery.php \
  -H "Content-Type: application/json" \
  -H "Cookie: PHPSESSID=valor_do_cookie" \
  -b cookies.txt \
  -d '{"id": 5}'
```

**Verificação Manual no Banco**:
```sql
SELECT COUNT(*) FROM gallery_items WHERE id = 5; -- Deve retornar 0
```

---

### Teste 8: Verificação de Sessão

**Objetivo**: Garantir que apenas usuários logados acessem endpoints protegidos.

**Passos**:
1. Faça logout (botão "Sair do Admin" no header)
2. Tente acessar diretamente: http://localhost:8000/api/get_requests.php no navegador

**Resultado Esperado**: 
- ✅ Retorna erro `{"success": false, "error": "Não autenticado"}`
- ✅ Mesma resposta para: add_gallery.php, delete_gallery.php, update_request.php

**Verificação do Backend**:
```bash
# Sem cookies (não logado)
curl http://localhost:8000/api/get_requests.php

# Deve retornar erro 401
```

---

### Teste 9: Logout

**Objetivo**: Verificar se logout destrói sessão corretamente.

**Passos**:
1. Com login feito, clique em "Sair do Admin" no header
2. Tente acessar admin novamente

**Resultado Esperado**: 
- ✅ Redirecionado para tela de login
- ✅ Sessão destruída no servidor
- ✅ Não consegue acessar endpoints protegidos

**Verificação do Backend**:
```bash
curl -X POST http://localhost:8000/api/logout.php \
  -H "Cookie: PHPSESSID=valor_do_cookie" \
  -b cookies.txt \
  -c cookies.txt

# Agora tenta acessar área protegida com o mesmo cookie
curl http://localhost:8000/api/get_requests.php \
  -b cookies.txt

# Deve retornar erro de não autenticado
```

---

## 🐛 Resolução de Problemas Comuns

### Erro: CORS (Access-Control-Allow-Origin)

**Sintoma**: Console do navegador mostra erro de CORS.

**Solução**: Verifique se `/api/config.php` tem os headers CORS:
```php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

Se estiver em produção, altere a origem:
```php
header('Access-Control-Allow-Origin: https://codigo1615.com.br');
```

---

### Erro: 404 Not Found em /api/

**Sintoma**: Requisições para `/api/login.php` retornam 404.

**Solução**: Verifique o servidor PHP:

**Se usando PHP built-in server**:
```bash
cd /caminho/completo/para/solinelson
php -S localhost:8000
```
Acesse: http://localhost:8000/api/login.php (deve retornar erro de método POST, não 404)

**Se usando Apache/Nginx**:
- Verifique se a pasta `api` existe no DocumentRoot
- Verifique permissões: `chmod -R 755 api/`

---

### Erro: Sessão não persiste entre requisições

**Sintoma**: Login funciona, mas ao tentar acessar `/api/get_requests.php` retorna "não autenticado".

**Solução**: Problema de cookies cross-domain.

1. Verifique se frontend e backend estão no mesmo domínio
2. Se não, configure `credentials: 'include'` no fetch (já está no APIService)
3. Verifique se `session_start()` está no início de todos os arquivos protegidos
4. Teste manualmente com curl e cookie persistence (`-c cookies.txt` e `-b cookies.txt`)

---

### Erro: Banco de Dados "Access Denied"

**Sintoma**: Erro ao tentar inserir/ler dados.

**Solução**: Verifique credenciais no `/api/config.php`:
```php
define('DB_HOST', '205.172.59.146');
define('DB_NAME', 'codigo1615admin_solinelson_db');
define('DB_USER', 'codigo1615admin_solinelson_user');
define('DB_PASS', 'sua_senha_aqui');
```

Teste conexão:
```bash
php test_connection.php
```

---

### Erro: JSON Parse Error no Frontend

**Sintoma**: Console mostra "SyntaxError: Unexpected token < in JSON".

**Solução**: O backend está retornando HTML (erro PHP) em vez de JSON.

1. Ative exibição de erros no PHP temporariamente:
```php
// No topo de config.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

2. Acesse a URL da API diretamente no navegador para ver o erro completo
3. Após corrigir, **remova** as linhas de debug

---

## 📊 Checklist Final de Testes

Marque conforme completa os testes:

- [ ] ✅ Teste 1: Galeria pública carrega
- [ ] ✅ Teste 2: Formulário de orçamento salva no banco
- [ ] ✅ Teste 3: Login com username e password funciona
- [ ] ✅ Teste 4: Admin vê lista de solicitações
- [ ] ✅ Teste 5: Admin atualiza status de solicitação
- [ ] ✅ Teste 6: Admin adiciona foto na galeria
- [ ] ✅ Teste 7: Admin deleta foto da galeria
- [ ] ✅ Teste 8: Endpoints protegidos bloqueiam acesso não autenticado
- [ ] ✅ Teste 9: Logout destrói sessão corretamente

---

## 🚀 Próximos Passos Após Testes

1. **Deploy para Produção**:
   - Copiar arquivos para servidor remoto
   - Atualizar `API_BASE_URL` no `index.tsx`
   - Configurar HTTPS (certificado SSL)
   - Ajustar headers CORS para domínio de produção

2. **Melhorias Opcionais**:
   - Adicionar mais usuários admin (tabela `admin_users`)
   - Implementar níveis de permissão
   - Adicionar upload de imagens (em vez de URL)
   - Relatórios e estatísticas no painel admin
   - Notificações por email ao receber nova solicitação

3. **Segurança**:
   - Trocar senha padrão do admin
   - Implementar rate limiting (limite de requisições)
   - Configurar firewall no servidor
   - Habilitar HTTPS obrigatório
   - Configurar backup automático do banco

---

**Última atualização**: Dezembro 2024  
**Versão do Sistema**: 1.0.0
