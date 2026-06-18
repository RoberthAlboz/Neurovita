<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $userId = $_GET['userId'] ?? null;

        if (!$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'ID do usuário não fornecido.']);
            exit();
        }

        $stmt = $pdo->prepare('SELECT id, fullName, email, cpf, phone, profile_image FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['message' => 'Usuário não encontrado.']);
            exit();
        }

        http_response_code(200);
        echo json_encode(['message' => 'Dados do usuário encontrados.', 'user' => $user]);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        $userId = $data['userId'] ?? null;
        $fullName = trim($data['fullName'] ?? '');
        $email = trim(strtolower($data['email'] ?? ''));
        $phone = trim($data['phone'] ?? '');

        if (!$userId || $fullName === '' || $email === '' || $phone === '') {
            http_response_code(400);
            echo json_encode(['message' => 'Dados incompletos para atualização.']);
            exit();
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['message' => 'E-mail inválido.']);
            exit();
        }

        $duplicate = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
        $duplicate->execute([$email, $userId]);
        if ($duplicate->fetch()) {
            http_response_code(409);
            echo json_encode(['message' => 'Este e-mail já está em uso por outro usuário.']);
            exit();
        }

        $stmt = $pdo->prepare('UPDATE users SET fullName = ?, email = ?, phone = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$fullName, $email, $phone, $userId]);

        $userStmt = $pdo->prepare('SELECT id, fullName, email, cpf, phone, profile_image FROM users WHERE id = ?');
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            http_response_code(404);
            echo json_encode(['message' => 'Usuário não encontrado.']);
            exit();
        }

        http_response_code(200);
        echo json_encode(['message' => 'Dados do usuário atualizados com sucesso.', 'user' => $user]);
        exit();
    }

    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);
} catch (PDOException $e) {
    error_log('Erro no perfil do usuário: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor ao processar perfil.']);
} catch (Exception $e) {
    error_log('Erro inesperado: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro inesperado.']);
}
?>
