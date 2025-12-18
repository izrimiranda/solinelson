<?php
/**
 * SOLINELSON - Serviço de Notificações por Email
 * 
 * Configuração usando SMTP do servidor mail.codigo1615.com.br
 * Usa PHPMailer para envio confiável de emails
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carregar PHPMailer (assumindo instalação via Composer)
require_once __DIR__ . '/../vendor/autoload.php';

class EmailService {
    private $mailer;
    private $pdo;
    
    // Configurações do servidor SMTP
    private const SMTP_HOST = 'mail.codigo1615.com.br';
    private const SMTP_PORT = 587; // ou 465 para SSL
    private const SMTP_USER = 'notificacao@codigo1615.com.br';
    private const SMTP_PASS = '$O+X2uC|%SOq?7BY';
    private const SMTP_FROM_EMAIL = 'notificacao@codigo1615.com.br';
    private const SMTP_FROM_NAME = 'Notificação - Código 1615';
    
    // Email de cópia
    private const ADMIN_EMAIL = 'izri@outlook.com';
    private const ADMIN_NAME = 'Administrador Solinelson';
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->mailer = new PHPMailer(true);
        $this->setupMailer();
    }
    
    /**
     * Configurar PHPMailer
     */
    private function setupMailer() {
        try {
            // Configurações do servidor
            $this->mailer->isSMTP();
            $this->mailer->Host = self::SMTP_HOST;
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = self::SMTP_USER;
            $this->mailer->Password = self::SMTP_PASS;
            $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // ou SMTPS para porta 465
            $this->mailer->Port = self::SMTP_PORT;
            $this->mailer->CharSet = 'UTF-8';
            
            // Remetente
            $this->mailer->setFrom(self::SMTP_FROM_EMAIL, self::SMTP_FROM_NAME);
            
            // Debug (desabilitar em produção)
            $this->mailer->SMTPDebug = 0;
            
        } catch (Exception $e) {
            error_log("Erro ao configurar mailer: " . $e->getMessage());
        }
    }
    
    /**
     * Enviar email de orçamento enviado
     * 
     * @param int $budgetRequestId ID da solicitação
     * @param array $data Dados do orçamento
     * @return bool
     */
    public function sendBudgetNotification($budgetRequestId, $data) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearCCs();
            
            // Destinatário principal (cliente)
            if (!empty($data['email'])) {
                $this->mailer->addAddress($data['email'], $data['name']);
            }
            
            // Cópia para admin
            $this->mailer->addCC(self::ADMIN_EMAIL, self::ADMIN_NAME);
            
            // Assunto
            $this->mailer->Subject = "Orçamento Solinelson - {$data['service_type']}";
            
            // Corpo do email (HTML)
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getBudgetEmailTemplate($data);
            $this->mailer->AltBody = $this->getBudgetEmailPlainText($data);
            
            // Enviar
            $sent = $this->mailer->send();
            
            // Registrar no log
            $this->logEmail($budgetRequestId, $data['email'], $data['name'], 
                "Orçamento - {$data['service_type']}", 'budget_sent', 
                $sent ? 'sent' : 'failed', 
                $sent ? null : $this->mailer->ErrorInfo
            );
            
            return $sent;
            
        } catch (Exception $e) {
            error_log("Erro ao enviar email de orçamento: " . $e->getMessage());
            $this->logEmail($budgetRequestId, $data['email'] ?? '', $data['name'] ?? '', 
                "Orçamento - {$data['service_type']}", 'budget_sent', 'failed', $e->getMessage()
            );
            return false;
        }
    }
    
    /**
     * Enviar email de aprovação do orçamento
     */
    public function sendApprovalNotification($budgetRequestId, $data) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearCCs();
            
            // Notificar apenas o admin
            $this->mailer->addAddress(self::ADMIN_EMAIL, self::ADMIN_NAME);
            
            $this->mailer->Subject = "✅ Orçamento Aprovado - {$data['name']}";
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getApprovalEmailTemplate($data);
            $this->mailer->AltBody = $this->getApprovalEmailPlainText($data);
            
            $sent = $this->mailer->send();
            
            $this->logEmail($budgetRequestId, self::ADMIN_EMAIL, self::ADMIN_NAME,
                "Orçamento Aprovado - {$data['name']}", 'budget_approved',
                $sent ? 'sent' : 'failed',
                $sent ? null : $this->mailer->ErrorInfo
            );
            
            return $sent;
            
        } catch (Exception $e) {
            error_log("Erro ao enviar email de aprovação: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Enviar email de serviço agendado
     */
    public function sendServiceScheduledNotification($budgetRequestId, $data) {
        try {
            $this->mailer->clearAddresses();
            $this->mailer->clearCCs();
            
            // Cliente
            if (!empty($data['email'])) {
                $this->mailer->addAddress($data['email'], $data['name']);
            }
            
            // Cópia para admin
            $this->mailer->addCC(self::ADMIN_EMAIL, self::ADMIN_NAME);
            
            $this->mailer->Subject = "🗓️ Serviço Agendado - Solinelson";
            $this->mailer->isHTML(true);
            $this->mailer->Body = $this->getScheduledEmailTemplate($data);
            $this->mailer->AltBody = $this->getScheduledEmailPlainText($data);
            
            $sent = $this->mailer->send();
            
            $this->logEmail($budgetRequestId, $data['email'], $data['name'],
                "Serviço Agendado", 'service_scheduled',
                $sent ? 'sent' : 'failed',
                $sent ? null : $this->mailer->ErrorInfo
            );
            
            return $sent;
            
        } catch (Exception $e) {
            error_log("Erro ao enviar email de agendamento: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Template HTML do email de orçamento
     */
    private function getBudgetEmailTemplate($data) {
        $value = number_format($data['budget_value'], 2, ',', '.');
        $executionDate = !empty($data['execution_date']) 
            ? date('d/m/Y', strtotime($data['execution_date'])) 
            : 'A definir';
        
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d48a02; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
        .info-row { margin: 10px 0; padding: 10px; background: white; border-left: 3px solid #d48a02; }
        .value { font-size: 24px; color: #d48a02; font-weight: bold; }
        .button { display: inline-block; padding: 12px 24px; background: #d48a02; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔧 Solinelson - Marido de Aluguel</h1>
            <p>Seu orçamento está pronto!</p>
        </div>
        
        <div class='content'>
            <p>Olá, <strong>{$data['name']}</strong>!</p>
            
            <p>Obrigado por solicitar um orçamento com a Solinelson. Segue abaixo os detalhes:</p>
            
            <div class='info-row'>
                <strong>📋 Serviço:</strong> {$data['service_type']}
            </div>
            
            <div class='info-row'>
                <strong>💰 Valor do Orçamento:</strong><br>
                <span class='value'>R$ {$value}</span>
            </div>
            
            <div class='info-row'>
                <strong>📅 Data Prevista:</strong> {$executionDate}
            </div>
            
            <div class='info-row'>
                <strong>📍 Endereço:</strong><br>
                {$data['street']}, {$data['number']} - {$data['neighborhood']}<br>
                {$data['city']} - {$data['state']}<br>
                CEP: {$data['cep']}
            </div>
            
            <p style='margin-top: 20px;'>
                <a href='https://wa.me/{$data['phone_whatsapp']}?text=Olá! Gostaria de confirmar o orçamento #{$data['id']}' class='button'>
                    💬 Confirmar pelo WhatsApp
                </a>
            </p>
            
            <p style='font-size: 14px; color: #666; margin-top: 20px;'>
                Caso tenha alguma dúvida ou queira ajustar algo, entre em contato conosco!
            </p>
        </div>
        
        <div class='footer'>
            <p><strong>Solinelson - Marido de Aluguel</strong></p>
            <p>📱 WhatsApp: (31) 97214-4254</p>
            <p>📧 Email: notificacao@codigo1615.com.br</p>
        </div>
    </div>
</body>
</html>
        ";
    }
    
    /**
     * Template de texto plano do email de orçamento
     */
    private function getBudgetEmailPlainText($data) {
        $value = number_format($data['budget_value'], 2, ',', '.');
        $executionDate = !empty($data['execution_date']) 
            ? date('d/m/Y', strtotime($data['execution_date'])) 
            : 'A definir';
        
        return "
SOLINELSON - MARIDO DE ALUGUEL
Seu orçamento está pronto!

Olá, {$data['name']}!

Obrigado por solicitar um orçamento com a Solinelson. Segue abaixo os detalhes:

SERVIÇO: {$data['service_type']}
VALOR DO ORÇAMENTO: R$ {$value}
DATA PREVISTA: {$executionDate}

ENDEREÇO:
{$data['street']}, {$data['number']} - {$data['neighborhood']}
{$data['city']} - {$data['state']}
CEP: {$data['cep']}

Para confirmar o orçamento, entre em contato pelo WhatsApp: (31) 97214-4254

Atenciosamente,
Equipe Solinelson
        ";
    }
    
    /**
     * Template HTML do email de aprovação
     */
    private function getApprovalEmailTemplate($data) {
        $value = number_format($data['budget_value'], 2, ',', '.');
        
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
</head>
<body style='font-family: Arial, sans-serif;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px; background: #f0f8ff; border: 2px solid #4CAF50;'>
        <h2 style='color: #4CAF50;'>✅ Orçamento Aprovado!</h2>
        
        <p><strong>Cliente:</strong> {$data['name']}</p>
        <p><strong>Telefone:</strong> {$data['phone']}</p>
        <p><strong>Email:</strong> {$data['email']}</p>
        <p><strong>Serviço:</strong> {$data['service_type']}</p>
        <p><strong>Valor:</strong> R$ {$value}</p>
        <p><strong>Data de Execução:</strong> " . date('d/m/Y', strtotime($data['execution_date'])) . "</p>
        
        <p style='margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;'>
            <strong>⚠️ Ação Necessária:</strong> Entre em contato com o cliente para confirmar os detalhes finais!
        </p>
    </div>
</body>
</html>
        ";
    }
    
    private function getApprovalEmailPlainText($data) {
        $value = number_format($data['budget_value'], 2, ',', '.');
        
        return "
ORÇAMENTO APROVADO!

Cliente: {$data['name']}
Telefone: {$data['phone']}
Email: {$data['email']}
Serviço: {$data['service_type']}
Valor: R$ {$value}
Data de Execução: " . date('d/m/Y', strtotime($data['execution_date'])) . "

AÇÃO NECESSÁRIA: Entre em contato com o cliente para confirmar os detalhes finais!
        ";
    }
    
    /**
     * Template HTML do email de serviço agendado
     */
    private function getScheduledEmailTemplate($data) {
        $value = number_format($data['budget_value'], 2, ',', '.');
        $executionDate = date('d/m/Y', strtotime($data['execution_date']));
        
        return "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
</head>
<body style='font-family: Arial, sans-serif;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9;'>
        <h2 style='color: #d48a02;'>🗓️ Serviço Agendado</h2>
        
        <p>Olá, <strong>{$data['name']}</strong>!</p>
        
        <p>Confirmamos o agendamento do seu serviço:</p>
        
        <div style='background: white; padding: 15px; margin: 10px 0; border-left: 3px solid #d48a02;'>
            <p><strong>Data:</strong> {$executionDate}</p>
            <p><strong>Serviço:</strong> {$data['service_type']}</p>
            <p><strong>Valor:</strong> R$ {$value}</p>
        </div>
        
        <p>Nosso profissional chegará no horário combinado. Qualquer dúvida, entre em contato!</p>
        
        <p style='margin-top: 20px;'>
            📱 WhatsApp: (31) 97214-4254
        </p>
    </div>
</body>
</html>
        ";
    }
    
    private function getScheduledEmailPlainText($data) {
        $value = number_format($data['budget_value'], 2, ',', '.');
        $executionDate = date('d/m/Y', strtotime($data['execution_date']));
        
        return "
SERVIÇO AGENDADO

Olá, {$data['name']}!

Confirmamos o agendamento do seu serviço:

Data: {$executionDate}
Serviço: {$data['service_type']}
Valor: R$ {$value}

Nosso profissional chegará no horário combinado. Qualquer dúvida, entre em contato!

WhatsApp: (31) 97214-4254
        ";
    }
    
    /**
     * Registrar email no banco de dados
     */
    private function logEmail($budgetRequestId, $recipientEmail, $recipientName, $subject, $emailType, $status, $errorMessage = null) {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO email_logs 
                (budget_request_id, recipient_email, recipient_name, subject, email_type, status, error_message, sent_at)
                VALUES (:budget_id, :email, :name, :subject, :type, :status, :error, NOW())
            ");
            
            $stmt->execute([
                'budget_id' => $budgetRequestId,
                'email' => $recipientEmail,
                'name' => $recipientName,
                'subject' => $subject,
                'type' => $emailType,
                'status' => $status,
                'error' => $errorMessage
            ]);
        } catch (PDOException $e) {
            error_log("Erro ao registrar log de email: " . $e->getMessage());
        }
    }
}

// Função helper para uso fácil
function sendEmail($pdo, $type, $budgetRequestId, $data) {
    $emailService = new EmailService($pdo);
    
    switch ($type) {
        case 'budget':
            return $emailService->sendBudgetNotification($budgetRequestId, $data);
        case 'approval':
            return $emailService->sendApprovalNotification($budgetRequestId, $data);
        case 'scheduled':
            return $emailService->sendServiceScheduledNotification($budgetRequestId, $data);
        default:
            return false;
    }
}
