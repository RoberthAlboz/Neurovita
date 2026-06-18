<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    $method = $_SERVER['REQUEST_METHOD'];

    // GET - Recuperar termos de consentimento do usuário
    if ($method === 'GET') {
        $userId = $_GET['userId'] ?? null;
        $termType = $_GET['termType'] ?? null;

        if (!$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'userId é obrigatório.']);
            exit();
        }

        if ($termType) {
            $stmt = $pdo->prepare("
                SELECT * FROM consent_terms
                WHERE userId = ? AND termType = ?
                ORDER BY createdAt DESC
                LIMIT 1
            ");
            $stmt->execute([$userId, $termType]);
            $term = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            $stmt = $pdo->prepare("
                SELECT * FROM consent_terms
                WHERE userId = ?
                ORDER BY createdAt DESC
            ");
            $stmt->execute([$userId]);
            $term = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        http_response_code(200);
        echo json_encode([
            'message' => 'Termo(s) de consentimento recuperado(s) com sucesso.',
            'terms' => $term ?: []
        ]);
        exit();
    }

    // POST - Registrar aceitação de termo de consentimento
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        $userId = $data['userId'] ?? null;
        $termType = $data['termType'] ?? null;
        $termVersion = $data['termVersion'] ?? '1.0';
        $accepted = isset($data['accepted']) ? (bool)$data['accepted'] : false;

        if (!$userId || !$termType) {
            http_response_code(400);
            echo json_encode(['message' => 'userId e termType são obrigatórios.']);
            exit();
        }

        // Validar tipos de termos permitidos
        $allowedTermTypes = ['privacy_policy', 'consent_form', 'data_processing'];
        if (!in_array($termType, $allowedTermTypes)) {
            http_response_code(400);
            echo json_encode(['message' => 'termType inválido. Tipos permitidos: ' . implode(', ', $allowedTermTypes)]);
            exit();
        }

        $acceptedAt = $accepted ? date('Y-m-d H:i:s') : null;
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        $stmt = $pdo->prepare("
            INSERT INTO consent_terms (userId, termType, termVersion, accepted, acceptedAt, ipAddress, userAgent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $termType,
            $termVersion,
            $accepted ? 1 : 0,
            $acceptedAt,
            $ipAddress,
            $userAgent
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Termo de consentimento registrado com sucesso.',
            'consentId' => (int)$pdo->lastInsertId()
        ]);
        exit();
    }

    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);

} catch (PDOException $e) {
    error_log('Erro ao processar consentimento: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor ao processar consentimento.']);
}
?>
