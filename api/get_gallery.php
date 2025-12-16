<?php
/**
 * SOLINELSON - Listar Galeria de Fotos
 * 
 * GET /api/get_gallery.php
 */

require_once 'config.php';

try {
    $stmt = $pdo->query("
        SELECT id, title, url, display_order, is_featured, created_at
        FROM gallery_items
        ORDER BY display_order ASC, created_at DESC
    ");
    
    $gallery = $stmt->fetchAll();
    
    // Formatar dados para o frontend
    $formattedGallery = array_map(function($item) {
        return [
            'id' => (int)$item['id'],
            'title' => $item['title'],
            'url' => $item['url']
        ];
    }, $gallery);
    
    respondSuccess($formattedGallery);
    
} catch (PDOException $e) {
    respondError('Erro ao buscar galeria', 500);
}
?>
