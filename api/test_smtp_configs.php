<?php
echo "🔍 Teste de Conectividade SMTP - mail.codigo1615.com.br\n\n";

require_once __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Configurações para testar
$configs = [
    [
        'name' => 'STARTTLS (Porta 587)',
        'port' => 587,
        'encryption' => PHPMailer::ENCRYPTION_STARTTLS
    ],
    [
        'name' => 'SSL/TLS (Porta 465)',
        'port' => 465,
        'encryption' => PHPMailer::ENCRYPTION_SMTPS
    ],
    [
        'name' => 'Sem Criptografia (Porta 25)',
        'port' => 25,
        'encryption' => ''
    ]
];

$host = 'mail.codigo1615.com.br';
$username = 'notificacao@codigo1615.com.br';
$password = '$O+X2uC|%SOq?7BY';

echo "📧 Testando servidor: $host\n";
echo "👤 Usuário: $username\n\n";

foreach ($configs as $config) {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "🔌 Testando: {$config['name']}\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    
    // Teste 1: Socket
    echo "1. Teste de socket na porta {$config['port']}... ";
    $socket = @fsockopen($host, $config['port'], $errno, $errstr, 5);
    if ($socket) {
        echo "✅ Conectado\n";
        fclose($socket);
    } else {
        echo "❌ Falhou ($errstr)\n";
        echo "   ⏭️  Pulando para próxima configuração\n\n";
        continue;
    }
    
    // Teste 2: PHPMailer
    echo "2. Teste de autenticação SMTP... ";
    
    try {
        $mail = new PHPMailer(true);
        $mail->SMTPDebug = 0;
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->SMTPAuth = true;
        $mail->Username = $username;
        $mail->Password = $password;
        $mail->SMTPSecure = $config['encryption'];
        $mail->Port = $config['port'];
        $mail->Timeout = 10;
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        $mail->setFrom($username, 'Solinelson Teste');
        $mail->addAddress('izri@outlook.com', 'Admin Teste');
        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = 'Teste ' . $config['name'] . ' - ' . date('H:i:s');
        $mail->Body = '<h2>✅ Teste Bem-Sucedido!</h2><p>Configuração: ' . $config['name'] . '</p><p>Hora: ' . date('d/m/Y H:i:s') . '</p>';
        $mail->AltBody = 'Teste bem-sucedido - ' . $config['name'];
        
        if ($mail->send()) {
            echo "✅ Enviado\n";
            echo "\n🎉 SUCESSO! Esta configuração está funcionando!\n";
            echo "📬 Verifique o email em: izri@outlook.com\n\n";
            echo "✅ Use esta configuração no email_service.php:\n";
            echo "   Host: $host\n";
            echo "   Port: {$config['port']}\n";
            echo "   Encryption: " . ($config['encryption'] ?: 'none') . "\n\n";
            
            // Parar aqui se encontrou uma configuração que funciona
            exit(0);
        } else {
            echo "❌ Falhou\n";
            echo "   Erro: " . $mail->ErrorInfo . "\n\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Exceção\n";
        echo "   Erro: " . $e->getMessage() . "\n\n";
    }
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "❌ Nenhuma configuração funcionou\n";
echo "\n🔍 Possíveis causas:\n";
echo "   1. Credenciais incorretas\n";
echo "   2. Firewall bloqueando conexões\n";
echo "   3. Servidor de email não está acessível\n";
echo "   4. Precisa configurar certificado SSL\n\n";
echo "💡 Tente:\n";
echo "   - Verificar se o servidor está online: ping mail.codigo1615.com.br\n";
echo "   - Testar manualmente: telnet mail.codigo1615.com.br 587\n";
echo "   - Verificar logs do servidor: sudo tail -f /var/log/mail.log\n";
?>
