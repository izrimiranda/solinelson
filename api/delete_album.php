<?php
/**
 * SOLINELSON - Deletar Álbum
 * 
 * POST /api/delete_album.php
 * Body: { id }
 * Requer autenticação
 * Deleta o álbum e todas as fotos associadas (CASCADE)
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

// Validar campo obrigatório
if (empty($input['id'])) {
    respondError('ID do álbum é obrigatório');
}

$id = (int)$input['id'];

try {
    // Deletar álbum (CASCADE deleta fotos automaticamente)
    $stmt = $pdo->prepare("DELETE FROM albums WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        respondError('Álbum não encontrado', 404);
    }
    
    respondSuccess(null, 'Álbum deletado com sucesso');
    
} catch (PDOException $e) {
    respondError('Erro ao deletar álbum', 500);
}
?>