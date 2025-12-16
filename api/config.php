<?php
/**
 * SOLINELSON - Configuração do Banco de Dados
 * 
 * Conexão PDO com MySQL
 */

// Headers CORS para permitir requisições do frontend
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost:3000';
header('Access-Control-Allow-Origin: ' . $origin);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Tratar requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurar sessão para funcionar com CORS em localhost
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax' // Lax funciona em localhost sem HTTPS
    ]);
    session_start();
}

// Configurações do banco de dados
define('DB_HOST', '205.172.59.146');
define('DB_PORT', 3306);
define('DB_NAME', 'codigo1615admin_solinelson_db');
define('DB_USER', 'codigo1615admin_solinelsonadmin');
define('DB_PASS', 'VTx}*qmcN1=uLMGh');

// Criar conexão PDO
try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro de conexão com banco de dados'
    ]);
    exit;
}

/**
 * Função para verificar se o usuário está autenticado
 */
function checkAuth() {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Não autenticado'
        ]);
        exit;
    }
}

/**
 * Função para sanitizar inputs
 */
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * Função para responder com JSON
 */
function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Função para responder com erro
 */
function respondError($message, $status = 400) {
    respond([
        'success' => false,
        'error' => $message
    ], $status);
}

/**
 * Função para responder com sucesso
 */
function respondSuccess($data = null, $message = null) {
    $response = ['success' => true];
    if ($message) $response['message'] = $message;
    if ($data) $response['data'] = $data;
    respond($response);
}
?>
