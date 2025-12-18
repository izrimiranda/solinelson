# 🔄 Modo Desenvolvimento vs Produção - Sistema de Emails

## 📍 Situação Atual

### ❌ Problema Identificado
O servidor SMTP **mail.codigo1615.com.br** não é acessível de **localhost** porque:
1. As portas SMTP (25, 465, 587) estão bloqueadas para conexões externas
2. O servidor está atrás do Cloudflare
3. Firewalls bloqueiam acesso direto às portas de email

### ✅ Solução Implementada
Criamos **DOIS arquivos de email**:

1. **`email_service.php`** → Para PRODUÇÃO (VPS)
2. **`email_service_dev.php`** → Para DESENVOLVIMENTO (localhost)

---

## 🏠 Modo Desenvolvimento (LOCAL)

### O que acontece:
- ✅ Email **NÃO é enviado** via SMTP
- ✅ HTML do email é **salvo em arquivo**
- ✅ Você pode **visualizar** o email no navegador
- ✅ Registro no banco com status `'simulated'`

### Como usar:

```php
// Em arquivos de teste ou desenvolvimento local
require_once 'email_service_dev.php';

$result = sendEmail($pdo, 'budget', $budgetId, $data);
// Gera arquivo HTML em: email_logs/2025-12-16_16-33-05_budget_sent_999.html
```

### Visualizar emails:

```bash
# Listar emails gerados
ls -lh email_logs/

# Abrir último email no navegador
xdg-open email_logs/$(ls -t email_logs/ | head -1)

# Ou copie o caminho completo mostrado no terminal e abra no navegador
```

### Vantagens:
- ✅ Testa toda lógica sem SMTP
- ✅ Vê exatamente como email ficará
- ✅ Não depende de configuração de servidor
- ✅ Não envia emails "de teste" para clientes reais

---

## 🚀 Modo Produção (VPS)

### O que acontece:
- ✅ Email é **enviado realmente** via SMTP
- ✅ Cliente recebe no email dele
- ✅ Admin recebe cópia
- ✅ Registro no banco com status `'sent'` ou `'failed'`

### Como usar:

```php
// Em arquivos de produção no servidor VPS
require_once 'email_service.php';

$result = sendEmail($pdo, 'budget', $budgetId, $data);
// Envia email real via mail.codigo1615.com.br
```

### Requisitos:
1. Código rodando **no servidor VPS** (205.172.59.146)
2. PHPMailer instalado: `composer require phpmailer/phpmailer`
3. Servidor SMTP acessível internamente
4. DNS configurado (SPF, DKIM, DMARC) - opcional mas recomendado

---

## 🔧 Configuração por Ambiente

### APIs que enviam email:

Atualize estes arquivos para usar o correto:

#### ✏️ `api/update_budget.php`

```php
<?php
require_once 'config.php';

// DESENVOLVIMENTO (localhost)
if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1') {
    require_once 'email_service_dev.php';
} 
// PRODUÇÃO (VPS ou domínio real)
else {
    require_once 'email_service.php';
}

// Resto do código...
```

#### ✏️ `api/approve_budget.php`

```php
<?php
require_once 'config.php';

// DESENVOLVIMENTO (localhost)
if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1') {
    require_once 'email_service_dev.php';
} 
// PRODUÇÃO (VPS ou domínio real)
else {
    require_once 'email_service.php';
}

// Resto do código...
```

#### ✏️ `api/resend_budget_notification.php`

```php
<?php
require_once 'config.php';

// DESENVOLVIMENTO (localhost)
if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['HTTP_HOST'] === '127.0.0.1') {
    require_once 'email_service_dev.php';
} 
// PRODUÇÃO (VPS ou domínio real)
else {
    require_once 'email_service.php';
}

// Resto do código...
```

---

## 📋 Checklist de Deploy

### 1️⃣ Desenvolvimento Local (✅ PRONTO)

- [x] Sistema de email simulado criado
- [x] Emails salvos em `email_logs/`
- [x] Teste funcionando: `php api/test_email.php`
- [x] HTML dos emails gerado corretamente

### 2️⃣ Preparar para Produção

- [ ] Atualizar `update_budget.php` com detecção de ambiente
- [ ] Atualizar `approve_budget.php` com detecção de ambiente
- [ ] Atualizar `resend_budget_notification.php` com detecção de ambiente
- [ ] Build do frontend: `npm run build`
- [ ] Commit e push para repositório

### 3️⃣ Deploy no Servidor VPS

- [ ] SSH no servidor: `ssh user@205.172.59.146`
- [ ] Fazer pull do código atualizado
- [ ] Executar SQL: `mysql < database_budget_update.sql`
- [ ] Instalar PHPMailer: `composer require phpmailer/phpmailer`
- [ ] Verificar permissões: `chmod 644 api/*.php`
- [ ] Testar no servidor: `php api/test_email.php`
- [ ] Verificar se email chegou em `izri@outlook.com`

### 4️⃣ Configurar DNS (Opcional mas Recomendado)

- [ ] SPF: `v=spf1 ip4:205.172.59.146 -all`
- [ ] DKIM: Gerar chaves no servidor
- [ ] DMARC: `v=DMARC1; p=quarantine; rua=mailto:izri@outlook.com`
- [ ] PTR: Configurar via painel da VPS

Detalhes completos em: `EMAIL_DNS_CONFIG.md`

---

## 🧪 Testando

### Desenvolvimento (Agora):

```bash
# Terminal 1: Rodar servidor
npm run dev

# Terminal 2: Testar email
php api/test_email.php

# Visualizar email gerado
xdg-open email_logs/$(ls -t email_logs/ | head -1)
```

### Produção (Após deploy):

```bash
# No servidor VPS
ssh user@205.172.59.146

cd /caminho/do/solinelson
php api/test_email.php

# Verificar email chegou
# Checar izri@outlook.com
```

---

## 📊 Monitoramento

### Desenvolvimento:

```bash
# Ver emails simulados
ls -lh email_logs/

# Último email gerado
cat email_logs/$(ls -t email_logs/ | head -1)
```

### Produção:

```sql
-- Ver emails enviados
SELECT * FROM email_logs 
WHERE status = 'sent' 
ORDER BY sent_at DESC 
LIMIT 10;

-- Ver emails falhados
SELECT * FROM email_logs 
WHERE status = 'failed' 
ORDER BY sent_at DESC;

-- Estatísticas
SELECT 
    email_type,
    status,
    COUNT(*) as total,
    MAX(sent_at) as ultimo_envio
FROM email_logs 
GROUP BY email_type, status;
```

```bash
# Logs do servidor de email
sudo tail -f /var/log/mail.log

# Logs do Apache/PHP
sudo tail -f /var/log/apache2/error.log
```

---

## 🎯 Resumo

| Aspecto | Desenvolvimento | Produção |
|---------|----------------|----------|
| **Arquivo** | `email_service_dev.php` | `email_service.php` |
| **Email enviado?** | ❌ Não (simulado) | ✅ Sim (SMTP real) |
| **Onde salva** | `email_logs/*.html` | Enviado por SMTP |
| **Precisa SMTP?** | ❌ Não | ✅ Sim |
| **Testa HTML?** | ✅ Sim | ✅ Sim |
| **Status no banco** | `simulated` | `sent` / `failed` |
| **Quando usar** | Localhost, testes | VPS, produção |

---

## 💡 Dicas

### 1. Alternância Automática

O código detecta automaticamente o ambiente:

```php
if ($_SERVER['HTTP_HOST'] === 'localhost') {
    // Usa email_service_dev.php
} else {
    // Usa email_service.php
}
```

### 2. Limpar Logs de Desenvolvimento

```bash
# Limpar emails antigos (mais de 7 dias)
find email_logs/ -name "*.html" -mtime +7 -delete
```

### 3. Testar HTML do Email

Os emails salvos são HTML completo. Abra no navegador para ver exatamente como ficará.

### 4. Forçar Modo

Se quiser forçar um modo específico:

```php
// Sempre desenvolvimento
require_once 'email_service_dev.php';

// Sempre produção
require_once 'email_service.php';
```

---

**📅 Criado em:** 16/12/2025  
**✅ Status:** Sistema funcionando em modo desenvolvimento  
**🚀 Próximo passo:** Deploy no servidor VPS para ativar email real
