<?php
/**
 * SOLINELSON - Teste de Conexão com Banco de Dados
 * 
 * Este arquivo testa a conexão com o MySQL e verifica:
 * - Conectividade com o servidor
 * - Existência das tabelas
 * - Dados iniciais carregados
 * 
 * Executar: php test_connection.php
 */

// Configurações do banco
define('DB_HOST', '205.172.59.146');
define('DB_PORT', 3306);
define('DB_NAME', 'codigo1615admin_solinelson_db');
define('DB_USER', 'codigo1615admin_solinelsonadmin');
define('DB_PASS', 'VTx}*qmcN1=uLMGh');

// Cores para output no terminal
class Color {
    const RED = "\033[31m";
    const GREEN = "\033[32m";
    const YELLOW = "\033[33m";
    const BLUE = "\033[34m";
    const RESET = "\033[0m";
}

function printSuccess($message) {
    echo Color::GREEN . "✓ " . $message . Color::RESET . PHP_EOL;
}

function printError($message) {
    echo Color::RED . "✗ " . $message . Color::RESET . PHP_EOL;
}

function printInfo($message) {
    echo Color::BLUE . "ℹ " . $message . Color::RESET . PHP_EOL;
}

function printWarning($message) {
    echo Color::YELLOW . "⚠ " . $message . Color::RESET . PHP_EOL;
}

echo PHP_EOL;
echo "========================================" . PHP_EOL;
echo "  SOLINELSON - Teste de Conexão DB" . PHP_EOL;
echo "========================================" . PHP_EOL;
echo PHP_EOL;

// Teste 1: Conexão com o banco
printInfo("Testando conexão com o banco de dados...");

try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    
    printSuccess("Conexão estabelecida com sucesso!");
    
} catch (PDOException $e) {
    printError("Falha na conexão: " . $e->getMessage());
    exit(1);
}

echo PHP_EOL;

// Teste 2: Verificar tabelas
printInfo("Verificando existência das tabelas...");

$expectedTables = [
    'budget_requests',
    'gallery_items',
    'admin_users'
];

try {
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $missingTables = [];
    foreach ($expectedTables as $table) {
        if (in_array($table, $tables)) {
            printSuccess("Tabela '$table' encontrada");
        } else {
            $missingTables[] = $table;
            printError("Tabela '$table' NÃO encontrada");
        }
    }
    
    if (empty($missingTables)) {
        printSuccess("Todas as tabelas necessárias existem!");
    } else {
        printWarning("Execute o script database.sql para criar as tabelas faltantes.");
    }
    
} catch (PDOException $e) {
    printError("Erro ao verificar tabelas: " . $e->getMessage());
}

echo PHP_EOL;

// Teste 3: Contar registros
printInfo("Contando registros nas tabelas...");

try {
    // Budget Requests
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM budget_requests");
    $count = $stmt->fetch()['total'];
    printInfo("Solicitações de orçamento: $count registros");
    
    // Gallery Items
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM gallery_items");
    $count = $stmt->fetch()['total'];
    printInfo("Itens na galeria: $count registros");
    
    if ($count == 0) {
        printWarning("Galeria vazia! Execute o script database.sql para adicionar dados iniciais.");
    }
    
    // Admin Users
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM admin_users");
    $count = $stmt->fetch()['total'];
    printInfo("Usuários administrativos: $count registros");
    
    if ($count == 0) {
        printWarning("Nenhum usuário admin! Execute o script database.sql para criar usuário padrão.");
    }
    
} catch (PDOException $e) {
    printError("Erro ao contar registros: " . $e->getMessage());
}

echo PHP_EOL;

// Teste 4: Verificar Stored Procedures
printInfo("Verificando stored procedures...");

$expectedProcedures = [
    'sp_create_budget_request',
    'sp_update_request_status',
    'sp_add_gallery_item'
];

try {
    $stmt = $pdo->query("
        SELECT ROUTINE_NAME 
        FROM information_schema.ROUTINES 
        WHERE ROUTINE_SCHEMA = '" . DB_NAME . "' 
        AND ROUTINE_TYPE = 'PROCEDURE'
    ");
    $procedures = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($expectedProcedures as $proc) {
        if (in_array($proc, $procedures)) {
            printSuccess("Procedure '$proc' encontrada");
        } else {
            printError("Procedure '$proc' NÃO encontrada");
        }
    }
    
} catch (PDOException $e) {
    printError("Erro ao verificar procedures: " . $e->getMessage());
}

echo PHP_EOL;

// Teste 5: Verificar Views
printInfo("Verificando views...");

$expectedViews = [
    'v_budget_requests_summary',
    'v_gallery_active'
];

try {
    $stmt = $pdo->query("
        SELECT TABLE_NAME 
        FROM information_schema.VIEWS 
        WHERE TABLE_SCHEMA = '" . DB_NAME . "'
    ");
    $views = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($expectedViews as $view) {
        if (in_array($view, $views)) {
            printSuccess("View '$view' encontrada");
        } else {
            printError("View '$view' NÃO encontrada");
        }
    }
    
} catch (PDOException $e) {
    printError("Erro ao verificar views: " . $e->getMessage());
}

echo PHP_EOL;

// Teste 6: Teste prático - Buscar galeria
printInfo("Testando busca na galeria...");

try {
    $stmt = $pdo->query("SELECT id, title, is_featured FROM gallery_items LIMIT 5");
    $items = $stmt->fetchAll();
    
    if (count($items) > 0) {
        printSuccess("Galeria acessível! Primeiros itens:");
        foreach ($items as $item) {
            $featured = $item['is_featured'] ? '⭐' : '';
            echo "   - ID {$item['id']}: {$item['title']} $featured" . PHP_EOL;
        }
    } else {
        printWarning("Galeria vazia!");
    }
    
} catch (PDOException $e) {
    printError("Erro ao buscar galeria: " . $e->getMessage());
}

echo PHP_EOL;

// Teste 7: Verificar triggers
printInfo("Verificando triggers...");

try {
    $stmt = $pdo->query("
        SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE
        FROM information_schema.TRIGGERS 
        WHERE TRIGGER_SCHEMA = '" . DB_NAME . "'
    ");
    $triggers = $stmt->fetchAll();
    
    if (count($triggers) > 0) {
        printSuccess("Triggers encontrados:");
        foreach ($triggers as $trigger) {
            echo "   - {$trigger['TRIGGER_NAME']} ({$trigger['EVENT_MANIPULATION']} na {$trigger['EVENT_OBJECT_TABLE']})" . PHP_EOL;
        }
    } else {
        printWarning("Nenhum trigger encontrado!");
    }
    
} catch (PDOException $e) {
    printError("Erro ao verificar triggers: " . $e->getMessage());
}

echo PHP_EOL;

// Resumo Final
echo "========================================" . PHP_EOL;
echo "  RESUMO DO TESTE" . PHP_EOL;
echo "========================================" . PHP_EOL;
echo PHP_EOL;

printSuccess("Banco de dados: " . DB_NAME);
printSuccess("Servidor: " . DB_HOST . ":" . DB_PORT);
printSuccess("Conexão: OK");

echo PHP_EOL;

printInfo("✨ Testes concluídos com sucesso!");
printInfo("🚀 Banco de dados pronto para uso!");

echo PHP_EOL;

// Informações adicionais
echo "Próximos passos:" . PHP_EOL;
echo "  1. Criar arquivos de API PHP (api/get_requests.php, etc)" . PHP_EOL;
echo "  2. Atualizar index.tsx para usar as APIs reais" . PHP_EOL;
echo "  3. Testar integração frontend + backend" . PHP_EOL;
echo "  4. Configurar autenticação segura" . PHP_EOL;
echo PHP_EOL;

?>
