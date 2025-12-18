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
    
    // Preparar dados para atualização
    $updateData = [
        'is_approved' => $isApproved,
        'status' => $newStatus,
        'id' => $id
    ];
    
    // Verificar se a coluna approved_at existe
    $stmt = $pdo->query("SHOW COLUMNS FROM budget_requests LIKE 'approved_at'");
    $hasApprovedAt = $stmt->rowCount() > 0;
    
    if ($hasApprovedAt) {
        $stmt = $pdo->prepare("
            UPDATE budget_requests 
            SET is_approved = :is_approved,
                status = :status,
                approved_at = :approved_at
            WHERE id = :id
        ");
        $updateData['approved_at'] = $isApproved ? date('Y-m-d H:i:s') : null;
    } else {
        $stmt = $pdo->prepare("
            UPDATE budget_requests 
            SET is_approved = :is_approved,
                status = :status
            WHERE id = :id
        ");
    }
    
    $stmt->execute($updateData);
    
    // Enviar email de notificação se aprovado
    if ($isApproved && !empty($request['email'])) {
        try {
            $emailData = [
                'name' => $request['name'],
                'email' => $request['email'],
                'phone' => $request['phone'],
                'service_type' => $request['service_type'],
                'budget_value' => $request['budget_value'],
                'execution_date' => $request['execution_date']
            ];
            
            sendEmail($pdo, 'approval', $id, $emailData);
        } catch (Exception $e) {
            // Log do erro mas não bloqueia a resposta
            error_log("Erro ao enviar email de aprovação: " . $e->getMessage());
        }
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
} catch (Exception $e) {
    error_log("Erro geral ao aprovar/rejeitar orçamento: " . $e->getMessage());
    respondError('Erro ao processar aprovação: ' . $e->getMessage(), 500);
}
