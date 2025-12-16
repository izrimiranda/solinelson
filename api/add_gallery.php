<?php
/**
 * SOLINELSON - Adicionar Foto à Galeria
 * 
 * POST /api/add_gallery.php
 * Body: { title, url }
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
if (empty($input['title']) || empty($input['url'])) {
    respondError('Título e URL são obrigatórios');
}

$title = sanitize($input['title']);
$url = $input['url']; // Não sanitizar URL para não quebrar

try {
    // Usar stored procedure (passa NULL para ordem automática e false para featured)
    $stmt = $pdo->prepare("CALL sp_add_gallery_item(?, ?, NULL, false)");
    $stmt->execute([$title, $url]);
    
    $result = $stmt->fetch();
    
    respondSuccess([
        'id' => $result['gallery_id']
    ], 'Foto adicionada com sucesso');
    
} catch (PDOException $e) {
    respondError('Erro ao adicionar foto: ' . $e->getMessage(), 500);
}
?>
