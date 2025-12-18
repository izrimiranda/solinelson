<?php
echo "🔍 Diagnóstico SMTP - Solinelson\n\n";

// Teste 1: Verificar se PHPMailer está disponível
echo "1️⃣ Testando PHPMailer...\n";
require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    $mail = new PHPMailer(true);
    echo "   ✅ PHPMailer carregado com sucesso\n\n";
} catch (Exception $e) {
    echo "   ❌ Erro ao carregar PHPMailer: " . $e->getMessage() . "\n";
    exit(1);
}

// Teste 2: Verificar conectividade SMTP
echo "2️⃣ Testando conexão SMTP...\n";
echo "   Host: mail.codigo1615.com.br\n";
echo "   Porta: 587 (STARTTLS)\n\n";

$socket = @fsockopen('mail.codigo1615.com.br', 587, $errno, $errstr, 10);
if ($socket) {
    echo "   ✅ Conexão estabelecida\n";
    fclose($socket);
} else {
    echo "   ❌ Falha na conexão: $errstr ($errno)\n";
    echo "   💡 Verifique firewall ou DNS\n";
    exit(1);
}

// Teste 3: Tentar autenticação SMTP
echo "\n3️⃣ Testando autenticação SMTP...\n";

try {
    $mail = new PHPMailer(true);
    $mail->SMTPDebug = 0; // Sem debug por enquanto
    $mail->isSMTP();
    $mail->Host = 'mail.codigo1615.com.br';
    $mail->SMTPAuth = true;
    $mail->Username = 'notificacao@codigo1615.com.br';
    $mail->Password = '$O+X2uC|%SOq?7BY';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->Timeout = 10; // Timeout de 10 segundos
    
    // Configurar remetente e destinatário de teste
    $mail->setFrom('notificacao@codigo1615.com.br', 'Solinelson - Teste');
    $mail->addAddress('izri@outlook.com', 'Teste');
    
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = 'Teste SMTP - ' . date('d/m/Y H:i:s');
    $mail->Body = '<h1>Teste de Email</h1><p>Se você recebeu este email, o sistema SMTP está funcionando!</p>';
    $mail->AltBody = 'Teste de Email - Se você recebeu este email, o sistema SMTP está funcionando!';
    
    echo "   📧 Enviando email de teste...\n";
    
    if ($mail->send()) {
        echo "   ✅ Email enviado com sucesso!\n";
        echo "\n📬 Verifique sua caixa de entrada: izri@outlook.com\n";
        echo "   (Pode levar alguns segundos para chegar)\n";
    } else {
        echo "   ❌ Falha ao enviar: " . $mail->ErrorInfo . "\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Erro: " . $e->getMessage() . "\n";
    echo "\n🔍 Debug detalhado:\n";
    echo "   " . $mail->ErrorInfo . "\n";
}

echo "\n✅ Diagnóstico concluído!\n";
?>
