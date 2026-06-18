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
$identifier = trim($data['identifier'] ?? '');
$password = (string)($data['password'] ?? '');

if ($identifier === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['message' => 'Dados incompletos.']);
    exit();
}

try {
    $pdo = getPDO();

    // GARANTIA DE ESTRUTURA (Auto-fix para evitar erro 500)
    // Verifica se a coluna 'role' existe na tabela 'users'
    $columns = $pdo->query("PRAGMA table_info(users)")->fetchAll(PDO::FETCH_ASSOC);
    $existingColumns = array_column($columns, 'name');
    if (!in_array('role', $existingColumns, true)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'patient'");
    }

    // Verifica se o admin padrão existe
    $stmtAdmin = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    $stmtAdmin->execute();
    if ($stmtAdmin->fetchColumn() == 0) {
        $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmtInsert = $pdo->prepare("INSERT OR IGNORE INTO users (fullName, email, cpf, phone, password, role) VALUES (?, ?, ?, ?, ?, 'admin')");
        $stmtInsert->execute(['Administrador Neurovita', 'admin@neurovita.com.br', '000.000.000-00', '(00) 00000-0000', $adminPassword]);
    }

    $cleanIdentifier = preg_replace('/\D/', '', $identifier);
    $identifierLower = strtolower($identifier);

    $stmt = $pdo->prepare('SELECT id, fullName, email, cpf, phone, password, role FROM users WHERE lower(email) = ? OR cpf = ? OR cpf = ? LIMIT 1');
    $stmt->execute([$identifierLower, $identifier, $cleanIdentifier]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'Usuário não encontrado.']);
        exit();
    }

    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['message' => 'Senha incorreta.']);
        exit();
    }

    $method = strpos($identifier, '@') !== false ? 'email' : 'cpf';
    $session = $pdo->prepare('INSERT INTO login_sessions (userId, loginMethod, loginIdentifier, ipAddress, userAgent) VALUES (?, ?, ?, ?, ?)');
    $session->execute([
        $user['id'],
        $method,
        $identifier,
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);

    http_response_code(200);
    echo json_encode([
        'message' => 'Login realizado com sucesso!',
        'user' => [
            'id' => (int)$user['id'],
            'fullName' => $user['fullName'],
            'name' => $user['fullName'],
            'email' => $user['email'],
            'cpf' => $user['cpf'],
            'phone' => $user['phone'],
            'role' => $user['role']
        ]
    ]);
} catch (PDOException $e) {
    error_log('Erro no login: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor ao realizar login.']);
}
?>
