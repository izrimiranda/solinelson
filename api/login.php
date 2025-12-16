<?php
/**
 * SOLINELSON - Autenticação de Administrador
 * 
 * POST /api/login.php
 * Body: { "username": "admin", "password": "admin" }
 */

require_once 'config.php';

// Apenas POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Método não permitido', 405);
}

// Receber dados JSON
$input = json_decode(file_get_contents('php://input'), true);

// Validar campos obrigatórios
if (empty($input['username']) || empty($input['password'])) {
    respondError('Username e senha são obrigatórios');
}

$username = sanitize($input['username']);
$password = $input['password']; // Não sanitizar senha para não alterar caracteres

try {
    // Buscar usuário no banco
    $stmt = $pdo->prepare("
        SELECT id, username, password_hash, full_name, email, is_active 
        FROM admin_users 
        WHERE username = ? AND is_active = 1
        LIMIT 1
    ");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    // Verificar se usuário existe
    if (!$user) {
        respondError('Credenciais inválidas', 401);
    }
    
    // Verificar senha
    if (!password_verify($password, $user['password_hash'])) {
        respondError('Credenciais inválidas', 401);
    }
    
    // Atualizar último login
    $stmt = $pdo->prepare("
        UPDATE admin_users 
        SET last_login = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    $stmt->execute([$user['id']]);
    
    // Criar sessão
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_id'] = $user['id'];
    $_SESSION['admin_username'] = $user['username'];
    $_SESSION['admin_name'] = $user['full_name'];
    
    // Responder com sucesso
    respondSuccess([
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'name' => $user['full_name'],
            'email' => $user['email']
        ]
    ], 'Login realizado com sucesso');
    
} catch (PDOException $e) {
    respondError('Erro ao processar login', 500);
}
?>
