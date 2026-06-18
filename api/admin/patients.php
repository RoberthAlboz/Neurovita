<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->query("SELECT id, fullName, email, cpf, phone, createdAt, isActive FROM users WHERE role = 'patient' ORDER BY fullName ASC");
        $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($patients);
    } 
    elseif ($method === 'DELETE') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'ID não fornecido.']);
            exit();
        }
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'patient'");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Paciente removido com sucesso.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro: ' . $e->getMessage()]);
}
?>
