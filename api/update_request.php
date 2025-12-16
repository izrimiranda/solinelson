<?php
/**
 * SOLINELSON - Atualizar Status da Solicitação
 * 
 * POST /api/update_request.php
 * Body: { id, status }
 * Requer autenticação
 */

require_once 'config.php';

// Verificar autenticação
checkAuth();

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Método não permitido', 405);
}

// Receber dados JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar campos obrigatórios
if (empty($input['id']) || empty($input['status'])) {
    respondError('ID e status são obrigatórios');
}

$id = (int)$input['id'];
$status = sanitize($input['status']);

// Validar status
if (!in_array($status, ['pending', 'contacted'])) {
    respondError('Status inválido');
}

try {
    // Usar stored procedure
    $stmt = $pdo->prepare("CALL sp_update_request_status(?, ?)");
    $stmt->execute([$id, $status]);
    
    respondSuccess(null, 'Status atualizado com sucesso');
    
} catch (PDOException $e) {
    respondError('Erro ao atualizar status', 500);
}
?>
