<?php
/**
 * SOLINELSON - Deletar Orçamento
 * 
 * DELETE /api/delete_budget.php
 * Requer autenticação
 * 
 * Deleta um orçamento permanentemente
 */

require_once 'config.php';

// Verificar autenticação
checkAuth();

// Verificar método
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    // Verificar se a solicitação existe
    $stmt = $pdo->prepare("SELECT id FROM budget_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $request = $stmt->fetch();
    
    if (!$request) {
        respondError('Solicitação não encontrada', 404);
    }
    
    // Deletar solicitação
    $stmt = $pdo->prepare("DELETE FROM budget_requests WHERE id = :id");
    $stmt->execute(['id' => $id]);
    
    respondSuccess([
        'message' => 'Orçamento deletado com sucesso',
        'id' => $id
    ]);
    
} catch (PDOException $e) {
    error_log("Erro ao deletar orçamento: " . $e->getMessage());
    respondError('Erro ao deletar orçamento: ' . $e->getMessage(), 500);
}
