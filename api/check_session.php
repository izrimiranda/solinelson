<?php
/**
 * SOLINELSON - Verificar Sessão
 * 
 * GET /api/check_session.php
 */

require_once 'config.php';

// Verificar se está autenticado
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    respondSuccess([
        'authenticated' => true,
        'user' => [
            'id' => $_SESSION['admin_id'],
            'username' => $_SESSION['admin_username'],
            'name' => $_SESSION['admin_name']
        ]
    ]);
} else {
    respond([
        'success' => true,
        'authenticated' => false
    ]);
}
?>
