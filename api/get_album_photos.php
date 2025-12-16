<?php
/**
 * SOLINELSON - Buscar Fotos do Álbum
 * 
 * GET /api/get_album_photos.php?album_id=X
 * Retorna todas as fotos de um álbum específico
 */

require_once 'config.php';

// Validar parâmetro
if (empty($_GET['album_id'])) {
    respondError('ID do álbum é obrigatório');
}

$album_id = (int)$_GET['album_id'];

try {
    // Buscar informações do álbum
    $stmt = $pdo->prepare("SELECT * FROM albums WHERE id = ?");
    $stmt->execute([$album_id]);
    $album = $stmt->fetch();
    
    if (!$album) {
        respondError('Álbum não encontrado', 404);
    }
    
    // Buscar fotos do álbum
    $stmt = $pdo->prepare("
        SELECT * FROM album_photos 
        WHERE album_id = ? 
        ORDER BY display_order, id
    ");
    $stmt->execute([$album_id]);
    $photos = $stmt->fetchAll();
    
    respond([
        'success' => true,
        'album' => $album,
        'photos' => $photos
    ]);
    
} catch (PDOException $e) {
    respondError('Erro ao buscar fotos do álbum', 500);
}
?>