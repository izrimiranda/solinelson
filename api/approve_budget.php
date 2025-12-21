<?php
/**
 * SOLINELSON - Aprovar/Rejeitar Orçamento
 * 
 * POST /api/approve_budget.php
 * Requer autenticação
 * 
 * Marca um orçamento como aprovado ou rejeitado
 */

require_once 'config.php';
require_once 'email_service.php';

// Verificar autenticação
checkAuth();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Método não permitido', 405);
}

// Obter dados JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar dados obrigatórios
if (!isset($input['id'])) {
    respondError('ID da solicitação é obrigatório');
}

if (!isset($input['is_approved'])) {
    respondError('Status de aprovação é obrigatório');
}

$id = (int)$input['id'];
$isApproved = (bool)$input['is_approved'];

try {
    // Buscar solicitação
    $stmt = $pdo->prepare("SELECT * FROM budget_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        respondError('Solicitação não encontrada', 404);
    }
    
    // Atualizar status
    $newStatus = $isApproved ? 'approved' : 'rejected';
    
    $stmt = $pdo->prepare("
        UPDATE budget_requests 
        SET is_approved = :is_approved,
            status = :status,
            approved_at = :approved_at
        WHERE id = :id
    ");
    
    $stmt->execute([
        'is_approved' => $isApproved,
        'status' => $newStatus,
        'approved_at' => $isApproved ? date('Y-m-d H:i:s') : null,
        'id' => $id
    ]);
    
    // Enviar email de notificação se aprovado
    if ($isApproved && !empty($request['email'])) {
        $emailData = [
            'name' => $request['name'],
            'email' => $request['email'],
            'phone' => $request['phone'],
            'service_type' => $request['service_type'],
            'budget_value' => $request['budget_value'],
            'execution_date' => $request['execution_date']
        ];
        
        sendEmail($pdo, 'approval', $id, $emailData);
    }
    
    // Buscar registro atualizado
    $stmt = $pdo->prepare("SELECT * FROM budget_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $updatedRequest = $stmt->fetch();
    
    $message = $isApproved ? 'Orçamento aprovado com sucesso' : 'Orçamento rejeitado';
    
    respondSuccess([
        'message' => $message,
        'request' => $updatedRequest
    ]);
    
} catch (PDOException $e) {
    error_log("Erro ao aprovar/rejeitar orçamento: " . $e->getMessage());
    respondError('Erro ao processar aprovação: ' . $e->getMessage(), 500);
}
