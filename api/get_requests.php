<?php
/**
 * SOLINELSON - Listar Solicitações de Orçamento
 * 
 * GET /api/get_requests.php
 * Requer autenticação
 */

require_once 'config.php';

// Verificar autenticação
checkAuth();

try {
    $stmt = $pdo->query("
        SELECT 
            id, name, phone, email, service_type, description, 
            service_date, cep, street, number, complement, 
            neighborhood, city, state, status, 
            budget_value, is_approved, execution_date, 
            budget_sent_at, approved_at, notes,
            created_at, updated_at
        FROM budget_requests
        ORDER BY created_at DESC
    ");
    
    $requests = $stmt->fetchAll();
    
    // Formatar dados para o frontend
    $formattedRequests = array_map(function($req) {
        return [
            'id' => (int)$req['id'],
            'name' => $req['name'],
            'phone' => $req['phone'],
            'email' => $req['email'],
            'serviceType' => $req['service_type'],
            'description' => $req['description'],
            'date' => $req['service_date'],
            'address' => [
                'cep' => $req['cep'],
                'street' => $req['street'],
                'number' => $req['number'],
                'complement' => $req['complement'],
                'neighborhood' => $req['neighborhood'],
                'city' => $req['city'],
                'state' => $req['state']
            ],
            'status' => $req['status'],
            'budgetValue' => $req['budget_value'] ? (float)$req['budget_value'] : null,
            'isApproved' => (bool)$req['is_approved'],
            'executionDate' => $req['execution_date'],
            'budgetSentAt' => $req['budget_sent_at'],
            'approvedAt' => $req['approved_at'],
            'notes' => $req['notes'],
            'createdAt' => $req['created_at']
        ];
    }, $requests);
    
    respondSuccess($formattedRequests);
    
} catch (PDOException $e) {
    respondError('Erro ao buscar solicitações', 500);
}
?>
