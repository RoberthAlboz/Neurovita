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
        $stmt = $pdo->query("
            SELECT a.*, u.fullName as patientName, u.cpf as patientCpf, u.email as patientEmail
            FROM appointments a 
            JOIN users u ON a.userId = u.id 
            ORDER BY a.scheduledDate DESC, a.scheduledTime DESC
        ");
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($appointments);
    } 
    elseif ($method === 'PATCH') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $status = $data['status'] ?? null;

        if (!$id || !$status) {
            http_response_code(400);
            echo json_encode(['message' => 'Dados incompletos.']);
            exit();
        }

        // RN01 - Status da Consulta (Alinhamento com o PDF)
        $allowedStatus = ['pending', 'confirmed', 'in_service', 'finished', 'cancelled', 'faltou'];
        if (!in_array($status, $allowedStatus)) {
            http_response_code(400);
            echo json_encode(['message' => 'Status inválido. Status permitidos: ' . implode(', ', $allowedStatus)]);
            exit();
        }

        $stmt = $pdo->prepare("UPDATE appointments SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$status, $id]);
        echo json_encode(['message' => 'Status do agendamento atualizado.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro: ' . $e->getMessage()]);
}
?>
