<?php
/**
 * SOLINELSON - Listar Álbuns
 * 
 * GET /api/get_albums.php
 * Retorna todos os álbuns com foto principal
 */

require_once 'config.php';

try {
    // Buscar álbuns com foto principal via view
    $stmt = $pdo->query("
        SELECT * FROM v_albums_with_main_photo 
        ORDER BY display_order, created_at DESC
    ");
    
    $albums = $stmt->fetchAll();
    
    respond([
        'success' => true,
        'albums' => $albums
    ]);
    
} catch (PDOException $e) {
    respondError('Erro ao buscar álbuns', 500);
}
?>