<?php
/**
 * Configuração e migração do banco SQLite do Neurovita.
 * Este script pode ser executado mais de uma vez com segurança.
 */
require_once __DIR__ . '/config.php';

try {
    $pdo = getPDO();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // O schema principal é criado e migrado por getPDO()/ensureCoreSchema(), em config.php.
    // Mantemos este endpoint para facilitar a inicialização manual e validar o banco.
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        "status" => "success",
        "message" => "Banco de dados SQLite configurado e migrado com sucesso.",
        "database" => __DIR__ . '/database.sqlite',
        "tables" => $tables
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Erro ao configurar banco: " . $e->getMessage()
    ]);
}
?>
