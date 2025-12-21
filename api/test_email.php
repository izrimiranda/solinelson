<?php
require_once 'config.php';

// Usar versão de desenvolvimento (sem SMTP)
require_once 'email_service_dev.php';

echo "🧪 Testando Sistema de Email (MODO DESENVOLVIMENTO)...\n\n";

// Dados de teste
$testData = [
    'id' => 999,
    'name' => 'Teste Sistema',
    'email' => 'izri@outlook.com',
    'phone' => '31972144254',
    'phone_whatsapp' => '5531972144254',
    'service_type' => 'Teste de Email SMTP',
    'budget_value' => 150.00,
    'execution_date' => date('Y-m-d', strtotime('+7 days')),
    'cep' => '33400-000',
    'street' => 'Rua Teste',
    'number' => '123',
    'neighborhood' => 'Centro',
    'city' => 'Lagoa Santa',
    'state' => 'MG'
];

echo "📧 Enviando email de teste para: " . $testData['email'] . "\n";
echo "📋 Serviço: " . $testData['service_type'] . "\n";
echo "💰 Valor: R$ " . number_format($testData['budget_value'], 2, ',', '.') . "\n";
echo "📅 Data de execução: " . date('d/m/Y', strtotime($testData['execution_date'])) . "\n\n";

// Tentar enviar email
try {
    $result = sendEmail($pdo, 'budget', 999, $testData);
    
    if ($result) {
        echo "✅ SUCESSO! Email enviado.\n\n";
        echo "📬 Verifique:\n";
        echo "   1. izri@outlook.com (destinatário principal)\n";
        echo "   2. izri@outlook.com (cópia admin)\n";
        echo "   3. Pasta de spam se não encontrar na caixa de entrada\n\n";
        
        // Verificar log no banco
        echo "📊 Verificando log no banco de dados...\n";
        $stmt = $pdo->query("SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 1");
        $log = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($log) {
            echo "   ✅ Registro criado no email_logs\n";
            echo "   📝 ID: " . $log['id'] . "\n";
            echo "   📧 Para: " . $log['recipient_email'] . "\n";
            echo "   🏷️ Tipo: " . $log['email_type'] . "\n";
            echo "   ✔️ Status: " . $log['status'] . "\n";
            echo "   ⏰ Enviado: " . $log['sent_at'] . "\n";
        }
    } else {
        echo "❌ ERRO: Email não foi enviado.\n\n";
        echo "🔍 Verifique:\n";
        echo "   1. Credenciais SMTP em api/email_service.php\n";
        echo "   2. Conexão com mail.codigo1615.com.br\n";
        echo "   3. Logs: sudo tail -20 /var/log/mail.log\n\n";
        
        // Tentar ver último erro no log
        $stmt = $pdo->query("SELECT * FROM email_logs WHERE status='failed' ORDER BY sent_at DESC LIMIT 1");
        $log = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($log) {
            echo "   ❌ Último erro registrado:\n";
            echo "   📝 " . $log['error_message'] . "\n";
        }
    }
} catch (Exception $e) {
    echo "❌ EXCEÇÃO: " . $e->getMessage() . "\n\n";
    echo "🔍 Detalhes do erro:\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n✅ Teste concluído!\n";
?>
