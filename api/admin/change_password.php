<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['userId']) || !isset($data['newPassword'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Dados incompletos']);
        exit();
    }
    
    $hashedPassword = password_hash($data['newPassword'], PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND role = 'admin'");
    $stmt->execute([$hashedPassword, $data['userId']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Senha administrativa alterada com sucesso']);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Administrador não encontrado ou erro na atualização']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro ao alterar senha: ' . $e->getMessage()]);
}
?>
