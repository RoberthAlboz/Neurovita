<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

try {
    require_once 'config.php';
    
    $pdo = getPDO();
    $drivers = PDO::getAvailableDrivers();
    
    // Tentar verificar se as tabelas existem
    $tables_exist = false;
    try {
        $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
        $tables_exist = $stmt->fetch() !== false;
    } catch (Exception $e) {}

    echo json_encode([
        "status" => "success",
        "message" => "O servidor PHP e o Banco de Dados estão conversando corretamente!",
        "details" => [
            "php_version" => PHP_VERSION,
            "sqlite_driver" => in_array('sqlite', $drivers) ? "Disponível" : "Indisponível",
            "database_file" => file_exists(__DIR__ . '/database.sqlite') ? "Encontrado" : "Não encontrado",
            "tables_initialized" => $tables_exist ? "Sim" : "NÃO (Acesse /api/setup_db.php para criar)",
            "write_permission" => is_writable(__DIR__) ? "OK" : "Sem permissão na pasta api"
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Houve um problema: " . $e->getMessage()
    ]);
}
?>
