<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$fullName = trim($data['fullName'] ?? '');
$email = trim(strtolower($data['email'] ?? ''));
// Normaliza CPF: remove tudo que não é dígito para garantir consistência com o login
$cpf = preg_replace('/\D/', '', trim($data['cpf'] ?? ''));
$phone = trim($data['phone'] ?? '');
$password = (string)($data['password'] ?? '');

if ($fullName === '' || $email === '' || $cpf === '' || $phone === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['message' => 'Dados incompletos.']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'E-mail inválido.']);
    exit();
}

try {
    $pdo = getPDO();

    // Garantia de estrutura
    $columns = $pdo->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, 'name');
    if (!in_array('role', $existingColumns, true)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'patient'");
    }

    $check = $pdo->prepare('SELECT id FROM users WHERE email = ? OR cpf = ? LIMIT 1');
    $check->execute([$email, $cpf]);

    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['message' => 'Email ou CPF já cadastrados.']);
        exit();
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $pdo->prepare('INSERT INTO users (fullName, email, cpf, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([$fullName, $email, $cpf, $phone, $passwordHash, 'patient']);

    $userId = (int)$pdo->lastInsertId();

    $session = $pdo->prepare('INSERT INTO login_sessions (userId, loginMethod, loginIdentifier, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)');
    $session->execute([
        $userId,
        'email',
        $email,
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);

    http_response_code(201);
    echo json_encode([
        'message' => 'Usuário cadastrado com sucesso!',
        'user' => [
            'id' => $userId,
            'fullName' => $fullName,
            'name' => $fullName,
            'email' => $email,
            'cpf' => $cpf,
            'phone' => $phone,
            'role' => 'patient'
        ]
    ]);
} catch (PDOException $e) {
    error_log('Erro no cadastro: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor ao cadastrar usuário.']);
}
?>
