<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getPDO();
    $password = 'admin123';
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE role = 'admin' OR email = 'admin@neurovita.com.br'");
    $stmt->execute([$hash]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(["status" => "success", "message" => "Senha do administrador resetada para 'admin123' com sucesso."]);
    } else {
        // Se não existir, criar
        $stmtInsert = $pdo->prepare("INSERT OR IGNORE INTO users (fullName, email, cpf, phone, password, role) VALUES (?, ?, ?, ?, ?, 'admin')");
        $stmtInsert->execute(['Administrador Neurovita', 'admin@neurovita.com.br', '000.000.000-00', '(00) 00000-0000', $hash]);
        echo json_encode(["status" => "success", "message" => "Usuário administrador criado com senha 'admin123'."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
