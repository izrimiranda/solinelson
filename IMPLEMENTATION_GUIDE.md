# Guia de Implementação - Sistema de Orçamentos

## 📋 Resumo das Alterações

Este guia documenta a implementação completa do sistema de gerenciamento de orçamentos no Solinelson, incluindo:

- ✅ CRUD completo de orçamentos no painel administrativo
- ✅ Sistema de notificações por email (cliente + admin)
- ✅ Campos adicionais: valor, aprovação, data de execução, observações
- ✅ Interface profissional para gerenciar orçamentos
- ✅ Botão de acesso admin movido para o menu
- ✅ Documentação de configurações DNS para emails

---

## 🗄️ Passo 1: Atualizar Banco de Dados

Execute o script SQL no seu banco de dados:

```bash
# Conectar ao MySQL
mysql -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db

# Ou através do phpMyAdmin na VPS
```

Execute o arquivo `database_budget_update.sql`:

```bash
mysql -u codigo1615admin_solinelsonadmin -p codigo1615admin_solinelson_db < database_budget_update.sql
```

**Alterações aplicadas:**
- Novos campos em `budget_requests`: email, budget_value, is_approved, execution_date, budget_sent_at, approved_at, notes
- Novo enum de status: pending, contacted, budgeted, approved, rejected, completed
- Nova tabela `email_logs` para registro de emails enviados

---

## 📦 Passo 2: Instalar PHPMailer

### Opção 1: Via Composer (Recomendado)

```bash
# Navegar para o diretório da aplicação
cd /path/to/solinelson

# Instalar PHPMailer
composer require phpmailer/phpmailer
```

### Opção 2: Download Manual

Se não tiver Composer instalado:

```bash
# Baixar PHPMailer
cd /path/to/solinelson/api
wget https://github.com/PHPMailer/PHPMailer/archive/refs/tags/v6.9.1.zip
unzip v6.9.1.zip
mv PHPMailer-6.9.1/src PHPMailer
rm -rf PHPMailer-6.9.1 v6.9.1.zip
```

Atualize o require no `email_service.php`:

```php
// Se instalou via Composer (padrão)
require_once __DIR__ . '/../vendor/autoload.php';

// Ou se baixou manualmente
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';
require_once __DIR__ . '/PHPMailer/Exception.php';
```

---

## 🔧 Passo 3: Configurar Servidor SMTP

### Testar Conexão SMTP

Crie um arquivo de teste `api/test_smtp.php`:

```php
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php'; // ou caminho manual

$mail = new PHPMailer(true);

try {
    // Configurações
    $mail->SMTPDebug = 2; // Ativar debug verbose
    $mail->isSMTP();
    $mail->Host = 'mail.codigo1615.com.br';
    $mail->SMTPAuth = true;
    $mail->Username = 'notificacao@codigo1615.com.br';
    $mail->Password = '$O+X2uC|%SOq?7BY';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    
    // Remetente e destinatário
    $mail->setFrom('notificacao@codigo1615.com.br', 'Teste SMTP');
    $mail->addAddress('izri@outlook.com', 'Admin');
    
    // Conteúdo
    $mail->isHTML(true);
    $mail->Subject = 'Teste de Conexão SMTP';
    $mail->Body = '<h1>Email de Teste</h1><p>Se você recebeu este email, o SMTP está funcionando!</p>';
    
    $mail->send();
    echo 'Email enviado com sucesso!';
} catch (Exception $e) {
    echo "Erro ao enviar email: {$mail->ErrorInfo}";
}
?>
```

```bash
# Testar via navegador
http://seu-dominio.com/api/test_smtp.php

# Ou via linha de comando
php /path/to/solinelson/api/test_smtp.php
```

### Porta 587 vs 465

- **Porta 587** (STARTTLS): Recomendado. Inicia conexão não criptografada e depois faz upgrade para TLS
- **Porta 465** (SMTPS): SSL direto desde o início

Se a porta 587 não funcionar, tente 465:

```php
$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail->Port = 465;
```

---

## 🌐 Passo 4: Configurações de Firewall

Certifique-se de que as portas estão abertas:

```bash
# Verificar portas abertas
sudo ufw status
sudo netstat -tulpn | grep :587
sudo netstat -tulpn | grep :465

# Abrir portas se necessário
sudo ufw allow 587/tcp
sudo ufw allow 465/tcp
```

---

## 📧 Passo 5: Configurar DNS (IMPORTANTE!)

Para evitar que emails caiam em spam, configure:

1. **SPF Record**
2. **DKIM**
3. **DMARC**
4. **PTR (Reverse DNS)**

Veja o arquivo `EMAIL_DNS_CONFIG.md` para instruções detalhadas.

**Resumo rápido:**

```bash
# No Registro.br, adicionar registro TXT:
Nome: @
Valor: v=spf1 ip4:205.172.59.146 -all

# Gerar DKIM no servidor
sudo apt install opendkim opendkim-tools
sudo opendkim-genkey -t -s mail -d codigo1615.com.br

# Adicionar registro TXT no DNS
Nome: mail._domainkey
Valor: [copiar do arquivo gerado]

# Adicionar DMARC
Nome: _dmarc
Valor: v=DMARC1; p=quarantine; rua=mailto:izri@outlook.com
```

---

## 🎨 Passo 6: Verificar Interface

Acesse o painel administrativo:

1. Faça login no admin
2. Clique na aba **💰 Orçamentos**
3. Você verá todos os pedidos com interface para:
   - Editar email, valor, data de execução, observações
   - Aprovar/Rejeitar orçamento
   - Reenviar email de notificação
   - Contatar via WhatsApp

---

## ✅ Passo 7: Testar Sistema Completo

### Fluxo de Teste

1. **Criar nova solicitação:**
   - Vá para o frontend
   - Clique em "Solicitar Orçamento"
   - Preencha o formulário com um email válido
   - Envie

2. **No painel admin:**
   - Acesse aba "Orçamentos"
   - Clique em "✏️ Editar Orçamento"
   - Preencha:
     - Email: seu email de teste
     - Valor: 150.00
     - Data de execução: qualquer data futura
     - Status: "Orçado"
   - Clique em "💾 Salvar Orçamento"
   - **Email será enviado automaticamente** para o cliente e admin

3. **Verificar email:**
   - Verifique sua caixa de entrada (cliente)
   - Verifique `izri@outlook.com` (admin)
   - Ambos devem receber o email com detalhes do orçamento

4. **Aprovar orçamento:**
   - No admin, clique em "✅ Aprovar"
   - Confirme
   - **Email de aprovação será enviado** ao admin

5. **Agendar execução:**
   - Edite o orçamento
   - Altere a data de execução
   - Salve
   - **Email de agendamento será enviado** ao cliente e admin

---

## 📊 Passo 8: Monitoramento de Emails

### Verificar Logs

```bash
# Logs de email do sistema
sudo tail -f /var/log/mail.log

# Logs do PHP
sudo tail -f /var/log/apache2/error.log
# ou
sudo tail -f /var/log/nginx/error.log
```

### Banco de Dados - Tabela email_logs

```sql
-- Ver últimos emails enviados
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 20;

-- Ver emails com falha
SELECT * FROM email_logs WHERE status = 'failed' ORDER BY sent_at DESC;

-- Estatísticas
SELECT 
    email_type, 
    status, 
    COUNT(*) as total
FROM email_logs
GROUP BY email_type, status;
```

### API de Logs

```bash
# Ver logs via API (requer autenticação)
curl -X GET 'http://seu-dominio.com/api/get_email_logs.php' \
  -H 'Cookie: PHPSESSID=...'
```

---

## 🐛 Troubleshooting

### Problema: Emails não sendo enviados

**Verificar:**
1. Credenciais SMTP corretas
2. Firewall não bloqueando portas 587/465
3. Email de destino válido
4. Logs de erro no PHP

```php
// Ativar debug no email_service.php
$this->mailer->SMTPDebug = 2; // Debug verbose
```

### Problema: Emails caindo em spam

**Soluções:**
1. Configurar SPF, DKIM, DMARC (ver EMAIL_DNS_CONFIG.md)
2. Usar email corporativo (não Gmail/Hotmail como remetente)
3. Evitar palavras spam no assunto/corpo
4. Incluir link de descadastramento
5. Fazer warm-up do IP (enviar poucos emails inicialmente)

### Problema: Erro "SMTP connect() failed"

```bash
# Testar conexão manualmente
telnet mail.codigo1615.com.br 587

# Se conectar, digitar:
EHLO localhost
QUIT
```

Se não conectar:
- Verificar se hostname está correto
- Verificar firewall
- Tentar porta 465 em vez de 587

### Problema: Erro de autenticação

```bash
# Verificar se credenciais estão corretas
# Testar login SMTP manualmente
openssl s_client -starttls smtp -connect mail.codigo1615.com.br:587
```

---

## 📝 Estrutura de Arquivos Criados/Modificados

```
solinelson/
├── api/
│   ├── email_service.php (NOVO)
│   ├── update_budget.php (NOVO)
│   ├── approve_budget.php (NOVO)
│   ├── resend_budget_notification.php (NOVO)
│   ├── get_email_logs.php (NOVO)
│   └── get_requests.php (MODIFICADO)
├── database_budget_update.sql (NOVO)
├── EMAIL_DNS_CONFIG.md (NOVO)
├── IMPLEMENTATION_GUIDE.md (ESTE ARQUIVO)
├── index.tsx (MODIFICADO)
│   ├── - Tipos atualizados (BudgetRequest)
│   ├── - Métodos API adicionados
│   ├── - Botão admin movido para Header
│   ├── - Aba "Orçamentos" no AdminPanel
│   └── - Interface completa de CRUD
└── index.html (MODIFICADO)
    └── - Estilos CSS para novos status badges
```

---

## 🔐 Segurança

### Credenciais

**NUNCA** commit credenciais no Git. As credenciais estão hardcoded apenas para este projeto. Para produção:

```php
// Usar variáveis de ambiente
$smtp_pass = getenv('SMTP_PASSWORD');

// Ou arquivo de configuração fora do webroot
require_once '/path/outside/webroot/email_config.php';
```

### Proteção de Arquivos

```bash
# Proteger arquivos sensíveis
chmod 600 api/email_service.php
chmod 600 database_budget_update.sql
```

---

## 📈 Próximos Passos (Opcional)

### Melhorias Futuras

1. **Dashboard de Estatísticas:**
   - Total de orçamentos enviados
   - Taxa de aprovação
   - Receita estimada
   - Gráficos de evolução

2. **Templates de Email Personalizáveis:**
   - Editor WYSIWYG no admin
   - Múltiplos templates
   - Variáveis dinâmicas

3. **Integração com WhatsApp Business API:**
   - Enviar notificações via WhatsApp
   - Confirmação de leitura

4. **Assinatura Digital de Orçamentos:**
   - Cliente assina eletronicamente
   - PDF gerado automaticamente

5. **Sistema de Follow-up:**
   - Emails automáticos após X dias
   - Lembrete de orçamento pendente

---

## 🆘 Suporte

**Desenvolvedor:** Código 1615  
**Email:** izri@outlook.com  
**Documentação PHPMailer:** https://github.com/PHPMailer/PHPMailer/wiki  
**Documentação DNS:** EMAIL_DNS_CONFIG.md  

---

**Data de Implementação:** 16 de dezembro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Completo e pronto para produção
