<?php
/**
 * SOLINELSON - Modo de Desenvolvimento (SEM SMTP)
 * 
 * Este arquivo simula o envio de emails para desenvolvimento local
 * sem precisar de conexão SMTP real.
 * 
 * Em PRODUÇÃO, use email_service.php
 */

class EmailServiceDev {
    private $pdo;
    private $logDir;
    
    public function __construct() {
        $this->logDir = __DIR__ . '/../email_logs';
        if (!file_exists($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
    }
    
    public function sendBudgetNotification($pdo, $budgetId, $requestData) {
        return $this->simulateEmail($pdo, $budgetId, 'budget_sent', $requestData);
    }
    
    public function sendApprovalNotification($pdo, $budgetId, $requestData) {
        return $this->simulateEmail($pdo, $budgetId, 'budget_approved', $requestData);
    }
    
    public function sendServiceScheduledNotification($pdo, $budgetId, $requestData) {
        return $this->simulateEmail($pdo, $budgetId, 'service_scheduled', $requestData);
    }
    
    private function simulateEmail($pdo, $budgetId, $emailType, $data) {
        echo "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "📧 SIMULAÇÃO DE EMAIL (MODO DEV)\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        
        // Determinar tipo de email
        $subject = '';
        $recipient = $data['email'] ?? 'izri@outlook.com';
        
        switch ($emailType) {
            case 'budget_sent':
                $subject = "Orçamento Disponível - Solinelson";
                echo "📨 Tipo: Orçamento Enviado ao Cliente\n";
                break;
            case 'budget_approved':
                $subject = "Cliente Aprovou Orçamento - Solinelson";
                $recipient = 'izri@outlook.com';
                echo "📨 Tipo: Notificação de Aprovação (Admin)\n";
                break;
            case 'service_scheduled':
                $subject = "Serviço Agendado - Solinelson";
                echo "📨 Tipo: Confirmação de Agendamento\n";
                break;
        }
        
        echo "📧 Para: $recipient\n";
        echo "📋 Assunto: $subject\n";
        echo "🆔 Budget ID: $budgetId\n";
        echo "👤 Cliente: {$data['name']}\n";
        
        if (isset($data['budget_value'])) {
            echo "💰 Valor: R$ " . number_format($data['budget_value'], 2, ',', '.') . "\n";
        }
        
        if (isset($data['execution_date'])) {
            echo "📅 Data: " . date('d/m/Y', strtotime($data['execution_date'])) . "\n";
        }
        
        // Gerar HTML do email
        $html = $this->generateHTML($emailType, $data);
        
        // Salvar em arquivo
        $filename = $this->logDir . '/' . date('Y-m-d_H-i-s') . '_' . $emailType . '_' . $budgetId . '.html';
        file_put_contents($filename, $html);
        
        echo "📁 Salvo em: " . basename($filename) . "\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        
        // Registrar no banco
        try {
            $stmt = $pdo->prepare("
                INSERT INTO email_logs 
                (budget_request_id, email_type, recipient_email, status, sent_at, error_message) 
                VALUES (?, ?, ?, 'simulated', NOW(), 'Modo desenvolvimento - email não enviado realmente')
            ");
            $stmt->execute([$budgetId, $emailType, $recipient]);
            echo "✅ Registrado no email_logs (status: simulated)\n";
        } catch (PDOException $e) {
            echo "⚠️  Não foi possível registrar no banco: " . $e->getMessage() . "\n";
        }
        
        echo "\n💡 Para visualizar o email, abra: file://$filename\n\n";
        
        return true;
    }
    
    private function generateHTML($emailType, $data) {
        $logoUrl = 'https://i.imgur.com/exemplo.png';
        $whatsapp = $data['phone_whatsapp'] ?? '';
        $name = htmlspecialchars($data['name'] ?? 'Cliente');
        
        $html = "<!DOCTYPE html>
<html lang='pt-BR'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>" . htmlspecialchars($emailType) . "</title>
</head>
<body style='margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
    <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
        
        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;'>
            <h1 style='color: white; margin: 0; font-size: 28px;'>Solinelson</h1>
            <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0 0;'>Serviços Profissionais de Manutenção</p>
        </div>
        
        <div style='padding: 40px 30px;'>";
        
        switch ($emailType) {
            case 'budget_sent':
                $value = number_format($data['budget_value'] ?? 0, 2, ',', '.');
                $executionDate = isset($data['execution_date']) 
                    ? date('d/m/Y', strtotime($data['execution_date'])) 
                    : 'A definir';
                
                $html .= "
            <h2 style='color: #333; margin-top: 0;'>Olá, $name! 👋</h2>
            
            <p style='color: #666; line-height: 1.6; font-size: 16px;'>
                Seu orçamento está pronto! Confira os detalhes abaixo:
            </p>
            
            <div style='background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 5px;'>
                <p style='margin: 0 0 10px 0; color: #333;'><strong>📋 Serviço:</strong> " . htmlspecialchars($data['service_type'] ?? '') . "</p>
                <p style='margin: 0 0 10px 0; color: #333;'><strong>💰 Valor:</strong> R$ $value</p>
                <p style='margin: 0; color: #333;'><strong>📅 Data prevista:</strong> $executionDate</p>
            </div>
            
            <div style='background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;'>
                <p style='margin: 0; color: #856404; font-size: 14px;'>
                    ⚠️ <strong>Importante:</strong> Este orçamento tem validade de 7 dias.
                </p>
            </div>
            
            <p style='color: #666; line-height: 1.6; margin-top: 25px;'>
                Para confirmar o serviço ou tirar dúvidas, entre em contato:
            </p>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='https://wa.me/$whatsapp?text=Ol%C3%A1%2C%20gostaria%20de%20confirmar%20o%20or%C3%A7amento' 
                   style='display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 16px;'>
                    💬 Confirmar no WhatsApp
                </a>
            </div>";
                break;
                
            case 'budget_approved':
                $value = number_format($data['budget_value'] ?? 0, 2, ',', '.');
                $html .= "
            <h2 style='color: #28a745; margin-top: 0;'>✅ Orçamento Aprovado!</h2>
            
            <p style='color: #666; line-height: 1.6; font-size: 16px;'>
                O cliente <strong>$name</strong> aprovou o orçamento:
            </p>
            
            <div style='background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 5px;'>
                <p style='margin: 0 0 10px 0; color: #155724;'><strong>💰 Valor:</strong> R$ $value</p>
                <p style='margin: 0 0 10px 0; color: #155724;'><strong>📞 Telefone:</strong> " . htmlspecialchars($data['phone'] ?? '') . "</p>
                <p style='margin: 0; color: #155724;'><strong>📋 Serviço:</strong> " . htmlspecialchars($data['service_type'] ?? '') . "</p>
            </div>
            
            <p style='color: #666; line-height: 1.6;'>
                Entre em contato para agendar o serviço!
            </p>";
                break;
                
            case 'service_scheduled':
                $executionDate = isset($data['execution_date']) 
                    ? date('d/m/Y', strtotime($data['execution_date'])) 
                    : 'A definir';
                $value = number_format($data['budget_value'] ?? 0, 2, ',', '.');
                
                $html .= "
            <h2 style='color: #333; margin-top: 0;'>Serviço Agendado! 📅</h2>
            
            <p style='color: #666; line-height: 1.6; font-size: 16px;'>
                Olá, $name!
            </p>
            
            <p style='color: #666; line-height: 1.6;'>
                Seu serviço foi agendado. Confira os detalhes:
            </p>
            
            <div style='background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 25px 0; border-radius: 5px;'>
                <p style='margin: 0 0 10px 0; color: #0d47a1;'><strong>📅 Data:</strong> $executionDate</p>
                <p style='margin: 0 0 10px 0; color: #0d47a1;'><strong>📋 Serviço:</strong> " . htmlspecialchars($data['service_type'] ?? '') . "</p>
                <p style='margin: 0; color: #0d47a1;'><strong>💰 Valor:</strong> R$ $value</p>
            </div>
            
            <p style='color: #666; line-height: 1.6;'>
                Caso precise reagendar ou tenha dúvidas, entre em contato pelo WhatsApp.
            </p>
            
            <div style='text-align: center; margin: 30px 0;'>
                <a href='https://wa.me/$whatsapp' 
                   style='display: inline-block; background: #25D366; color: white; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 16px;'>
                    💬 WhatsApp
                </a>
            </div>";
                break;
        }
        
        $html .= "
        </div>
        
        <div style='background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;'>
            <p style='margin: 0; color: #6c757d; font-size: 14px;'>
                © 2025 Solinelson - Serviços de Manutenção
            </p>
            <p style='margin: 10px 0 0 0; color: #6c757d; font-size: 12px;'>
                [MODO DESENVOLVIMENTO - EMAIL NÃO ENVIADO]
            </p>
        </div>
        
    </div>
</body>
</html>";
        
        return $html;
    }
}

/**
 * Função wrapper para compatibilidade
 */
function sendEmail($pdo, $emailType, $budgetId, $data) {
    $service = new EmailServiceDev();
    
    switch ($emailType) {
        case 'budget':
            return $service->sendBudgetNotification($pdo, $budgetId, $data);
        case 'approval':
            return $service->sendApprovalNotification($pdo, $budgetId, $data);
        case 'scheduled':
            return $service->sendServiceScheduledNotification($pdo, $budgetId, $data);
        default:
            echo "❌ Tipo de email desconhecido: $emailType\n";
            return false;
    }
}
?>
