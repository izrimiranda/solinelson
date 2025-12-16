<?php
/**
 * SOLINELSON - Deletar Foto da Galeria
 * 
 * POST /api/delete_gallery.php
 * Body: { id }
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
if (empty($input['id'])) {
    respondError('ID é obrigatório');
}

$id = (int)$input['id'];

try {
    $stmt = $pdo->prepare("DELETE FROM gallery_items WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        respondError('Foto não encontrada', 404);
    }
    
    respondSuccess(null, 'Foto deletada com sucesso');
    
} catch (PDOException $e) {
    respondError('Erro ao deletar foto', 500);
}
?>
