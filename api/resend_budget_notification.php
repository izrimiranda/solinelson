<?php
/**
 * SOLINELSON - Reenviar Notificação de Orçamento
 * 
 * POST /api/resend_budget_notification.php
 * Requer autenticação
 * 
 * Reenvia o email de notificação do orçamento para o cliente
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
    // Buscar solicitação
    $stmt = $pdo->prepare("SELECT * FROM budget_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        respondError('Solicitação não encontrada', 404);
    }
    
    // Verificar se tem email
    if (empty($request['email'])) {
        respondError('Email do cliente não informado');
    }
    
    // Verificar se tem valor de orçamento
    if (empty($request['budget_value']) || $request['budget_value'] <= 0) {
        respondError('Valor do orçamento não informado');
    }
    
    // Preparar dados para email
    $emailData = [
        'id' => $request['id'],
        'name' => $request['name'],
        'email' => $request['email'],
        'phone' => $request['phone'],
        'phone_whatsapp' => preg_replace('/\D/', '', $request['phone']),
        'service_type' => $request['service_type'],
        'budget_value' => $request['budget_value'],
        'execution_date' => $request['execution_date'],
        'cep' => $request['cep'],
        'street' => $request['street'],
        'number' => $request['number'],
        'neighborhood' => $request['neighborhood'],
        'city' => $request['city'],
        'state' => $request['state']
    ];
    
    // Enviar email
    $sent = sendEmail($pdo, 'budget', $id, $emailData);
    
    if ($sent) {
        respondSuccess([
            'message' => 'Email reenviado com sucesso',
            'email' => $request['email']
        ]);
    } else {
        respondError('Falha ao enviar email. Verifique os logs.');
    }
    
} catch (PDOException $e) {
    error_log("Erro ao reenviar notificação: " . $e->getMessage());
    respondError('Erro ao reenviar notificação: ' . $e->getMessage(), 500);
}
