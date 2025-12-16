<?php
/**
 * SOLINELSON - Logout
 * 
 * POST /api/logout.php
 */

require_once 'config.php';

// Destruir sessão
session_destroy();

respondSuccess(null, 'Logout realizado com sucesso');
?>
