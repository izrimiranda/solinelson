<?php
/**
 * SOLINELSON - Atualizar Orçamento
 * 
 * POST /api/update_budget.php
 * Requer autenticação
 * 
 * Atualiza informações do orçamento (valor, data de execução, aprovação)
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

$id = (int)$input['id'];

try {
    // Buscar registro atual
    $stmt = $pdo->prepare("SELECT * FROM budget_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $currentRequest = $stmt->fetch();
    
    if (!$currentRequest) {
        respondError('Solicitação não encontrada', 404);
    }
    
    // Preparar campos para atualização
    $updates = [];
    $params = ['id' => $id];
    
    // Campos que podem ser atualizados
    $allowedFields = [
        'email' => 'string',
        'status' => 'string',
        'budget_value' => 'float',
        'execution_date' => 'string',
        'notes' => 'string'
    ];
    
    foreach ($allowedFields as $field => $type) {
        if (isset($input[$field])) {
            $dbField = $field;
            $updates[] = "$dbField = :$field";
            
            // Converter tipo se necessário
            if ($type === 'float') {
                $params[$field] = (float)$input[$field];
            } else {
                $params[$field] = $input[$field];
            }
        }
    }
    
    // Se não houver campos para atualizar
    if (empty($updates)) {
        respondError('Nenhum campo para atualizar');
    }
    
    // Executar atualização
    $sql = "UPDATE budget_requests SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Atualizar timestamp budget_sent_at se valor do orçamento foi definido
    if (isset($input['budget_value']) && $input['budget_value'] > 0 && empty($currentRequest['budget_sent_at'])) {
        $pdo->prepare("UPDATE budget_requests SET budget_sent_at = NOW() WHERE id = :id")
            ->execute(['id' => $id]);
        
        // Buscar dados atualizados para envio de email
        $stmt = $pdo->prepare("SELECT * FROM budget_requests WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $updatedRequest = $stmt->fetch();
        
        // Preparar dados para email
        if (!empty($updatedRequest['email'])) {
            $emailData = [
                'id' => $updatedRequest['id'],
                'name' => $updatedRequest['name'],
                'email' => $updatedRequest['email'],
                'phone' => $updatedRequest['phone'],
                'phone_whatsapp' => preg_replace('/\D/', '', $updatedRequest['phone']),
                'service_type' => $updatedRequest['service_type'],
                'budget_value' => $updatedRequest['budget_value'],
                'execution_date' => $updatedRequest['execution_date'],
                'cep' => $updatedRequest['cep'],
                'street' => $updatedRequest['street'],
                'number' => $updatedRequest['number'],
                'neighborhood' => $updatedRequest['neighborhood'],
                'city' => $updatedRequest['city'],
                'state' => $updatedRequest['state']
            ];
            
            // Enviar email de orçamento
            sendEmail($pdo, 'budget', $id, $emailData);
        }
    }
    
    // Se a data de execução foi definida/alterada, enviar email de agendamento
    if (isset($input['execution_date']) && !empty($input['execution_date']) 
        && $input['execution_date'] !== $currentRequest['execution_date']) {
        
        $stmt = $pdo->prepare("SELECT * FROM budget_requests WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $updatedRequest = $stmt->fetch();
        
        if (!empty($updatedRequest['email']) && $updatedRequest['is_approved']) {
            $emailData = [
                'name' => $updatedRequest['name'],
                'email' => $updatedRequest['email'],
                'phone' => $updatedRequest['phone'],
                'service_type' => $updatedRequest['service_type'],
                'budget_value' => $updatedRequest['budget_value'],
                'execution_date' => $updatedRequest['execution_date']
            ];
            
            sendEmail($pdo, 'scheduled', $id, $emailData);
        }
    }
    
    // Buscar registro atualizado
    $stmt = $pdo->prepare("SELECT * FROM budget_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $updatedRequest = $stmt->fetch();
    
    respondSuccess([
        'message' => 'Orçamento atualizado com sucesso',
        'request' => $updatedRequest
    ]);
    
} catch (PDOException $e) {
    error_log("Erro ao atualizar orçamento: " . $e->getMessage());
    respondError('Erro ao atualizar orçamento: ' . $e->getMessage(), 500);
}
