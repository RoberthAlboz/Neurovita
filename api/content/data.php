<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    $type = $_GET['type'] ?? 'all';

    $response = [];

    if ($type === 'specialties' || $type === 'all') {
        $stmt = $pdo->query('SELECT * FROM specialties');
        $response['specialties'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    if ($type === 'professionals' || $type === 'all') {
        $stmt = $pdo->query('SELECT * FROM professionals');
        $response['professionals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    http_response_code(200);
    echo json_encode($response);

} catch (PDOException $e) {
    error_log('Erro ao buscar conteúdo: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno ao carregar conteúdo dinâmico.']);
}
?>
