<?php
/**
 * SOLINELSON - Adicionar Álbum com Fotos
 * 
 * POST /api/add_album.php
 * Body: { title, description, photos: [{url, title, width, height}], main_photo_index }
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
if (empty($input['title']) || empty($input['photos']) || !is_array($input['photos'])) {
    respondError('Título e fotos são obrigatórios');
}

$title = sanitize($input['title']);
$description = isset($input['description']) ? sanitize($input['description']) : '';
$photos = $input['photos'];
$main_photo_index = isset($input['main_photo_index']) ? (int)$input['main_photo_index'] : 0;

// Validar que há pelo menos uma foto
if (count($photos) === 0) {
    respondError('É necessário pelo menos uma foto');
}

// Validar índice da foto principal
if ($main_photo_index < 0 || $main_photo_index >= count($photos)) {
    $main_photo_index = 0;
}

try {
    // Preparar JSON das fotos
    $photos_json = json_encode($photos);
    
    // Chamar stored procedure
    $stmt = $pdo->prepare("CALL sp_create_album(?, ?, ?, ?, @album_id)");
    $stmt->execute([$title, $description, $photos_json, $main_photo_index]);
    
    // Buscar ID do álbum criado
    $result = $pdo->query("SELECT @album_id as album_id")->fetch();
    $album_id = $result['album_id'];
    
    // Buscar álbum completo
    $stmt = $pdo->prepare("SELECT * FROM v_albums_with_main_photo WHERE id = ?");
    $stmt->execute([$album_id]);
    $album = $stmt->fetch();
    
    respondSuccess($album, 'Álbum criado com sucesso', 201);
    
} catch (PDOException $e) {
    error_log("Erro ao criar álbum: " . $e->getMessage());
    respondError('Erro ao criar álbum: ' . $e->getMessage(), 500);
}
?>