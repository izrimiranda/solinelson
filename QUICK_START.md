# ⚡ Quick Start - Sistema de Orçamentos

## 🎯 Passos Rápidos (10 minutos)

### 1️⃣ Atualizar Banco de Dados (2 min)

```bash
# SSH na VPS
ssh user@205.172.59.146

# Executar SQL
mysql -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db < database_budget_update.sql
# Senha: VTx}*qmcN1=uLMGh
```

**✅ Confirmar:**
```sql
# Verificar se novos campos existem
DESCRIBE budget_requests;
# Deve mostrar: email, budget_value, is_approved, execution_date, notes

# Verificar nova tabela
DESCRIBE email_logs;
```

---

### 2️⃣ Instalar PHPMailer (3 min)

**Opção A - Composer (recomendado):**
```bash
cd /caminho/do/solinelson
composer require phpmailer/phpmailer
```

**Opção B - Manual:**
```bash
cd /caminho/do/solinelson/api
wget https://github.com/PHPMailer/PHPMailer/archive/refs/tags/v6.9.1.tar.gz
tar -xzf v6.9.1.tar.gz
mv PHPMailer-6.9.1/src PHPMailer
rm -rf PHPMailer-6.9.1 v6.9.1.tar.gz
```

Se usou opção B, edite `api/email_service.php` linha 11:
```php
// Trocar de:
require_once __DIR__ . '/../vendor/autoload.php';

// Para:
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';
require_once __DIR__ . '/PHPMailer/Exception.php';
```

---

### 3️⃣ Testar Email (2 min)

Crie arquivo `api/test_email.php`:

```php
<?php
require_once 'config.php';
require_once 'email_service.php';

$testData = [
    'id' => 999,
    'name' => 'Teste',
    'email' => 'SEU_EMAIL@gmail.com', // ← TROQUE AQUI
    'phone' => '31972144254',
    'phone_whatsapp' => '5531972144254',
    'service_type' => 'Teste SMTP',
    'budget_value' => 100.00,
    'execution_date' => date('Y-m-d'),
    'cep' => '00000-000',
    'street' => 'Rua Teste',
    'number' => '123',
    'neighborhood' => 'Centro',
    'city' => 'Belo Horizonte',
    'state' => 'MG'
];

$result = sendEmail($pdo, 'budget', 999, $testData);

if ($result) {
    echo "✅ Email enviado com sucesso! Verifique sua caixa de entrada.\n";
} else {
    echo "❌ Erro ao enviar. Verifique logs em /var/log/mail.log\n";
}
?>
```

```bash
# Executar teste
php api/test_email.php

# Verificar logs se houver erro
sudo tail -f /var/log/mail.log
```

---

### 4️⃣ Build do Frontend (1 min)

```bash
cd /caminho/do/solinelson

# Se tiver npm run dev ativo, parar (Ctrl+C)

# Build de produção
npm run build

# Reiniciar servidor de desenvolvimento (se estiver usando)
npm run dev
```

---

### 5️⃣ Testar Interface (2 min)

1. **Abra o site:**
   - http://localhost:8000 (dev)
   - ou http://seu-dominio.com (prod)

2. **Faça login no admin:**
   - Clique no botão "🔒 Admin" no menu (canto superior direito)
   - Login: admin
   - Senha: sua_senha

3. **Acesse aba Orçamentos:**
   - Clique em "💰 Orçamentos"
   - Você verá todas as solicitações

4. **Teste edição:**
   - Clique em "✏️ Editar Orçamento" em qualquer solicitação
   - Preencha:
     - Email: seu_email@gmail.com
     - Valor: 150.00
     - Data de execução: qualquer data futura
   - Clique em "💾 Salvar Orçamento"
   - **Email será enviado automaticamente!**

5. **Verificar email:**
   - Cheque seu email
   - Cheque izri@outlook.com (cópia admin)

---

## 🎨 Como Usar no Dia a Dia

### Fluxo Normal:

```
1. Cliente solicita orçamento no site
   ↓
2. Admin recebe notificação (já estava implementado)
   ↓
3. Admin acessa "💰 Orçamentos" no painel
   ↓
4. Admin clica "✏️ Editar Orçamento"
   ↓
5. Admin preenche:
   - Email do cliente
   - Valor do orçamento
   - Data de execução (opcional)
   - Status: "Orçado"
   ↓
6. Admin clica "💾 Salvar"
   ↓
7. 📧 Sistema envia email automaticamente para:
   - Cliente (com valor, data, link WhatsApp)
   - Admin (cópia)
   ↓
8. Cliente confirma via WhatsApp
   ↓
9. Admin clica "✅ Aprovar"
   ↓
10. 📧 Sistema notifica admin sobre aprovação
    ↓
11. Admin define/ajusta data de execução
    ↓
12. 📧 Sistema envia confirmação de agendamento
```

---

## 🚨 Solução Rápida de Problemas

### ❌ Email não chega

```bash
# 1. Verificar logs
sudo tail -20 /var/log/mail.log

# 2. Ver erros do PHP
sudo tail -20 /var/log/apache2/error.log

# 3. Testar SMTP manualmente
telnet mail.codigo1615.com.br 587
# Se conectar: OK
# Se não conectar: verificar firewall

# 4. Verificar banco de dados
mysql -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 5;
# Ver se há status='failed'
```

### ❌ Botão admin não aparece

```bash
# Limpar cache do navegador
# Ctrl + Shift + R (Chrome/Firefox)
# ou
# Ctrl + F5

# Verificar se está na versão correta
# Procurar "IconLock" no código fonte da página (F12)
```

### ❌ Erro ao salvar orçamento

```bash
# Verificar permissões
ls -la api/update_budget.php
# Deve ter -rw-r--r-- ou superior

# Verificar sessão
# Fazer logout e login novamente no admin
```

---

## 📧 Configurar DNS (Opcional mas IMPORTANTE)

**⚠️ IMPORTANTE:** Para emails não caírem em spam, configure DNS.

### No Registro.br:

1. **SPF Record:**
   ```
   Tipo: TXT
   Nome: @
   Valor: v=spf1 ip4:205.172.59.146 -all
   ```

2. **DKIM:** (gerar no servidor primeiro)
   ```bash
   # No servidor VPS
   sudo apt install opendkim opendkim-tools
   sudo mkdir -p /etc/opendkim/keys/codigo1615.com.br
   sudo opendkim-genkey -t -s mail -d codigo1615.com.br -D /etc/opendkim/keys/codigo1615.com.br/
   sudo cat /etc/opendkim/keys/codigo1615.com.br/mail.txt
   # Copiar o valor "p=" para o DNS
   ```
   
   ```
   Tipo: TXT
   Nome: mail._domainkey
   Valor: v=DKIM1; k=rsa; p=[valor_copiado]
   ```

3. **DMARC:**
   ```
   Tipo: TXT
   Nome: _dmarc
   Valor: v=DMARC1; p=quarantine; rua=mailto:izri@outlook.com
   ```

**📖 Detalhes completos:** Ver `EMAIL_DNS_CONFIG.md`

---

## ✅ Checklist de Verificação

```
□ Banco de dados atualizado (novos campos existem)
□ PHPMailer instalado (via Composer ou manual)
□ Teste de email funcionando (test_email.php)
□ Frontend buildado (npm run build)
□ Interface admin funcionando (aba Orçamentos visível)
□ Botão admin no menu (não no footer)
□ Email de teste recebido
□ DNS configurado (SPF, DKIM, DMARC) - opcional mas recomendado
```

---

## 📞 Precisa de Ajuda?

1. **Logs detalhados:**
   ```bash
   # Email
   sudo tail -50 /var/log/mail.log
   
   # Apache/PHP
   sudo tail -50 /var/log/apache2/error.log
   
   # Banco de dados
   SELECT * FROM email_logs WHERE status='failed';
   ```

2. **Documentação completa:**
   - `IMPLEMENTATION_GUIDE.md` - Guia passo a passo
   - `EMAIL_DNS_CONFIG.md` - Configuração DNS
   - `BUDGET_SYSTEM_README.md` - Documentação completa

3. **Contato:**
   - Email: izri@outlook.com
   - WhatsApp: (31) 97214-4254

---

**⏱️ Tempo total:** ~10 minutos  
**📅 Data:** 16/12/2025  
**✅ Status:** Pronto para uso!
