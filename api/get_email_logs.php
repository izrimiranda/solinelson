<?php
/**
 * SOLINELSON - Obter Logs de Email
 * 
 * GET /api/get_email_logs.php?budget_id={id}
 * Requer autenticação
 * 
 * Retorna o histórico de emails enviados para uma solicitação
 */

require_once 'config.php';

// Verificar autenticação
checkAuth();

try {
    $budgetId = isset($_GET['budget_id']) ? (int)$_GET['budget_id'] : null;
    
    if ($budgetId) {
        // Buscar logs de um orçamento específico
        $stmt = $pdo->prepare("
            SELECT * FROM email_logs 
            WHERE budget_request_id = :budget_id
            ORDER BY sent_at DESC
        ");
        $stmt->execute(['budget_id' => $budgetId]);
    } else {
        // Buscar todos os logs (últimos 100)
        $stmt = $pdo->query("
            SELECT * FROM email_logs 
            ORDER BY sent_at DESC
            LIMIT 100
        ");
    }
    
    $logs = $stmt->fetchAll();
    
    respondSuccess($logs);
    
} catch (PDOException $e) {
    error_log("Erro ao buscar logs de email: " . $e->getMessage());
    respondError('Erro ao buscar logs: ' . $e->getMessage(), 500);
}
