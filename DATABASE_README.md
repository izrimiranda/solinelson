# 📊 Solinelson - Documentação do Banco de Dados

## 🔐 Credenciais de Acesso

```
Host: 205.172.59.146
Porta: 3306
Banco: codigo1615admin_solinelson_db
Usuário: codigo1615admin_solinelsonadmin
Senha: VTx}*qmcN1=uLMGh
```

---

## 🚀 Como Executar o Script SQL

### Via Terminal (Linux/Mac)

```bash
# Executar o script completo
mysql -h 205.172.59.146 -P 3306 -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db < database.sql
```

### Via phpMyAdmin ou Cliente MySQL

1. Conecte-se ao banco de dados com as credenciais acima
2. Selecione o banco `codigo1615admin_solinelson_db`
3. Abra o arquivo `database.sql`
4. Execute o script completo

### Via MySQL Workbench

1. **File** → **Open SQL Script**
2. Selecione `database.sql`
3. Execute o script (⚡ ícone de raio)

---

## 📁 Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. `budget_requests` - Solicitações de Orçamento

Armazena todas as solicitações de orçamento dos clientes.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK, AUTO_INCREMENT) | ID único da solicitação |
| `name` | VARCHAR(255) | Nome do cliente |
| `phone` | VARCHAR(20) | Telefone/WhatsApp |
| `service_type` | VARCHAR(255) | Tipo de serviço solicitado |
| `description` | TEXT | Descrição detalhada |
| `service_date` | DATE | Data desejada para o serviço |
| `address_json` | JSON | Endereço completo (formato JSON) |
| `cep` | VARCHAR(10) | CEP |
| `street` | VARCHAR(255) | Rua |
| `number` | VARCHAR(50) | Número |
| `complement` | VARCHAR(255) | Complemento |
| `neighborhood` | VARCHAR(255) | Bairro |
| `city` | VARCHAR(255) | Cidade |
| `state` | VARCHAR(2) | Estado (UF) |
| `status` | ENUM | 'pending' ou 'contacted' |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

**Exemplo de JSON no campo `address_json`:**
```json
{
  "cep": "33600-000",
  "street": "Rua Exemplo",
  "number": "123",
  "complement": "Apto 45",
  "neighborhood": "Centro",
  "city": "Pedro Leopoldo",
  "state": "MG"
}
```

---

#### 2. `gallery_items` - Galeria de Fotos

Armazena as fotos da galeria de trabalhos realizados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK, AUTO_INCREMENT) | ID único da foto |
| `title` | VARCHAR(255) | Título/descrição da foto |
| `url` | TEXT | URL da imagem |
| `display_order` | INT | Ordem de exibição |
| `is_featured` | BOOLEAN | Se está em destaque |
| `file_size` | INT | Tamanho em bytes |
| `mime_type` | VARCHAR(100) | Tipo MIME (image/jpeg, etc) |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

---

#### 3. `admin_users` - Usuários Administrativos

Gerencia os usuários que podem acessar o painel administrativo.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK, AUTO_INCREMENT) | ID único do usuário |
| `username` | VARCHAR(100) | Nome de usuário (único) |
| `password_hash` | VARCHAR(255) | Hash bcrypt da senha |
| `full_name` | VARCHAR(255) | Nome completo |
| `email` | VARCHAR(255) | Email |
| `is_active` | BOOLEAN | Se o usuário está ativo |
| `last_login` | TIMESTAMP | Último login |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data de atualização |

**Usuário Padrão:**
- Username: `admin`
- Password: `admin` (⚠️ ALTERE EM PRODUÇÃO!)

---

## 🔧 Stored Procedures

### 1. `sp_create_budget_request`

Cria uma nova solicitação de orçamento.

**Parâmetros:**
- `p_name` - Nome do cliente
- `p_phone` - Telefone
- `p_service_type` - Tipo de serviço
- `p_description` - Descrição
- `p_service_date` - Data desejada
- `p_cep` - CEP
- `p_street` - Rua
- `p_number` - Número
- `p_complement` - Complemento
- `p_neighborhood` - Bairro
- `p_city` - Cidade
- `p_state` - Estado

**Exemplo de Uso:**
```sql
CALL sp_create_budget_request(
    'João Silva',
    '31972144254',
    'Instalação Hidráulica',
    'Preciso instalar torneiras e chuveiro',
    '2025-12-20',
    '33600-000',
    'Rua Exemplo',
    '123',
    'Casa 2',
    'Centro',
    'Pedro Leopoldo',
    'MG'
);
```

---

### 2. `sp_update_request_status`

Atualiza o status de uma solicitação.

**Parâmetros:**
- `p_id` - ID da solicitação
- `p_status` - Novo status ('pending' ou 'contacted')

**Exemplo:**
```sql
CALL sp_update_request_status(1, 'contacted');
```

---

### 3. `sp_add_gallery_item`

Adiciona uma foto à galeria.

**Parâmetros:**
- `p_title` - Título da foto
- `p_url` - URL da imagem
- `p_display_order` - Ordem de exibição (NULL = automático)
- `p_is_featured` - Se está em destaque (0 ou 1)

**Exemplo:**
```sql
CALL sp_add_gallery_item(
    'Instalação Completa',
    'https://exemplo.com/foto.jpg',
    NULL,
    TRUE
);
```

---

## 👁️ Views Úteis

### `v_budget_requests_summary`

Resumo de solicitações por status e data.

```sql
SELECT * FROM v_budget_requests_summary;
```

**Resultado Exemplo:**
| status | total | date |
|--------|-------|------|
| pending | 5 | 2025-12-16 |
| contacted | 3 | 2025-12-16 |

---

### `v_gallery_active`

Galeria ordenada para exibição.

```sql
SELECT * FROM v_gallery_active;
```

---

## 🔒 Triggers de Validação

### Validação de Telefone

**Trigger:** `trg_validate_phone_before_insert` e `trg_validate_phone_before_update`

**Função:**
- Remove caracteres não numéricos do telefone
- Valida se o telefone tem pelo menos 10 dígitos

**Exemplo:**
```sql
-- Entrada: (31) 97214-4254
-- Armazenado: 31972144254

-- ❌ Erro se tentar inserir telefone inválido:
INSERT INTO budget_requests (name, phone, ...) VALUES ('João', '123', ...);
-- Erro: Telefone inválido: deve conter pelo menos 10 dígitos
```

---

## 📊 Queries Úteis

### Listar Solicitações Pendentes

```sql
SELECT 
    id,
    name,
    phone,
    service_type,
    city,
    created_at
FROM budget_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

---

### Solicitações de Hoje

```sql
SELECT * FROM budget_requests 
WHERE DATE(created_at) = CURDATE()
ORDER BY created_at DESC;
```

---

### Estatísticas por Status

```sql
SELECT 
    status,
    COUNT(*) as total,
    DATE(created_at) as data
FROM budget_requests 
GROUP BY status, DATE(created_at)
ORDER BY data DESC;
```

---

### Solicitações por Cidade

```sql
SELECT 
    city,
    COUNT(*) as total
FROM budget_requests 
GROUP BY city
ORDER BY total DESC;
```

---

### Galeria com Fotos em Destaque

```sql
SELECT * FROM gallery_items 
WHERE is_featured = TRUE 
ORDER BY display_order ASC;
```

---

### Buscar Solicitações por Telefone (WhatsApp)

```sql
SELECT * FROM budget_requests 
WHERE phone LIKE '%97214%'
ORDER BY created_at DESC;
```

---

## 🔄 Backup e Restauração

### Fazer Backup

```bash
# Backup completo
mysqldump -h 205.172.59.146 -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db > backup_solinelson_$(date +%Y%m%d).sql

# Backup apenas estrutura (sem dados)
mysqldump -h 205.172.59.146 -u codigo1615admin_solinelsonadmin -p --no-data codigo1615admin_solinelson_db > structure_only.sql

# Backup apenas dados (sem estrutura)
mysqldump -h 205.172.59.146 -u codigo1615admin_solinelsonadmin -p --no-create-info codigo1615admin_solinelson_db > data_only.sql
```

---

### Restaurar Backup

```bash
mysql -h 205.172.59.146 -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db < backup_solinelson_20251216.sql
```

---

## 🛠️ Próximos Passos (Integração Backend)

### 1. Criar Estrutura de API PHP

```
api/
├── config.php              # Configuração do banco
├── get_requests.php        # Listar solicitações
├── add_request.php         # Criar solicitação
├── update_request.php      # Atualizar status
├── get_gallery.php         # Listar galeria
├── add_gallery.php         # Adicionar foto
├── delete_gallery.php      # Deletar foto
└── login.php               # Autenticação admin
```

---

### 2. Exemplo de `api/config.php`

```php
<?php
// Configuração do banco de dados
define('DB_HOST', '205.172.59.146');
define('DB_PORT', 3306);
define('DB_NAME', 'codigo1615admin_solinelson_db');
define('DB_USER', 'codigo1615admin_solinelsonadmin');
define('DB_PASS', 'VTx}*qmcN1=uLMGh');

// Conexão PDO
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    die(json_encode(['error' => 'Erro de conexão: ' . $e->getMessage()]));
}
?>
```

---

### 3. Exemplo de `api/get_requests.php`

```php
<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $stmt = $pdo->query("
        SELECT 
            id, name, phone, service_type, description, 
            service_date, cep, street, number, complement, 
            neighborhood, city, state, status, created_at
        FROM budget_requests
        ORDER BY created_at DESC
    ");
    
    $requests = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $requests
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

---

### 4. Exemplo de `api/add_request.php`

```php
<?php
header('Content-Type: application/json');
require_once 'config.php';

// Receber dados JSON
$data = json_decode(file_get_contents('php://input'), true);

try {
    $stmt = $pdo->prepare("
        CALL sp_create_budget_request(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['name'],
        $data['phone'],
        $data['serviceType'],
        $data['description'],
        $data['date'],
        $data['address']['cep'],
        $data['address']['street'],
        $data['address']['number'],
        $data['address']['complement'],
        $data['address']['neighborhood'],
        $data['address']['city'],
        $data['address']['state']
    ]);
    
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'request_id' => $result['request_id']
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

---

## 🔐 Segurança

### Checklist de Segurança

- ✅ **Usar Prepared Statements** (evita SQL Injection)
- ✅ **Validar inputs no backend** (nunca confiar no frontend)
- ✅ **Hash de senhas com bcrypt** (`password_hash()` no PHP)
- ✅ **HTTPS obrigatório** em produção
- ⚠️ **Alterar senha padrão** do admin
- ⚠️ **Limitar tentativas de login** (rate limiting)
- ⚠️ **Validar uploads de imagem** (tipo, tamanho, nome)
- ⚠️ **CORS configurado** adequadamente
- ⚠️ **Sessions seguras** (httponly, secure)

---

## 📞 Contato e Suporte

**Desenvolvido por:** Código 1615  
**Site:** https://www.codigo1615.com.br  
**Data:** 16 de dezembro de 2025

---

## 📝 Notas de Versão

### v1.0 (16/12/2025)
- ✅ Criação inicial das tabelas
- ✅ Stored procedures implementadas
- ✅ Views e triggers configurados
- ✅ Dados iniciais inseridos
- ✅ Documentação completa

---

**🎉 Banco de dados pronto para uso!**
