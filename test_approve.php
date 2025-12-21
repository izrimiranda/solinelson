<?php
// Teste do approve_budget.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testando approve_budget.php...\n\n";

// Simular dados
$_SERVER['REQUEST_METHOD'] = 'POST';
file_put_contents('php://input', json_encode(['id' => 1, 'is_approved' => false]));

// Testar se o arquivo tem erros de sintaxe
$output = [];
$result = 0;
exec('php -l api/approve_budget.php 2>&1', $output, $result);

echo "Checagem de sintaxe:\n";
echo implode("\n", $output) . "\n";
echo "Código de retorno: $result\n";

if ($result === 0) {
    echo "\n✅ Sem erros de sintaxe!\n";
} else {
    echo "\n❌ Erros encontrados!\n";
}
