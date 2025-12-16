<?php
/**
 * SOLINELSON - Criar Solicitação de Orçamento
 * 
 * POST /api/add_request.php
 * Body: { name, phone, serviceType, description, date, address }
 */

require_once 'config.php';

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Método não permitido', 405);
}

// Receber dados JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar campos obrigatórios
if (empty($input['name']) || empty($input['phone']) || empty($input['serviceType'])) {
    respondError('Nome, telefone e tipo de serviço são obrigatórios');
}

// Sanitizar dados
$name = sanitize($input['name']);
$phone = sanitize($input['phone']);
$serviceType = sanitize($input['serviceType']);
$description = sanitize($input['description'] ?? '');
$date = sanitize($input['date'] ?? null);

$address = $input['address'] ?? [];
$cep = sanitize($address['cep'] ?? '');
$street = sanitize($address['street'] ?? '');
$number = sanitize($address['number'] ?? '');
$complement = sanitize($address['complement'] ?? '');
$neighborhood = sanitize($address['neighborhood'] ?? '');
$city = sanitize($address['city'] ?? '');
$state = sanitize($address['state'] ?? '');

try {
    // Usar stored procedure
    $stmt = $pdo->prepare("
        CALL sp_create_budget_request(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $name,
        $phone,
        $serviceType,
        $description,
        $date,
        $cep,
        $street,
        $number,
        $complement,
        $neighborhood,
        $city,
        $state
    ]);
    
    $result = $stmt->fetch();
    
    respondSuccess([
        'id' => $result['request_id']
    ], 'Solicitação criada com sucesso');
    
} catch (PDOException $e) {
    respondError('Erro ao criar solicitação: ' . $e->getMessage(), 500);
}
?>
