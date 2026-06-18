<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();

    // Buscar agendamentos do usuário
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $userId = $_GET['userId'] ?? null;

        if (!$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'ID do usuário não fornecido.']);
            exit();
        }

        $stmt = $pdo->prepare('SELECT * FROM appointments WHERE userId = ? ORDER BY scheduledDate DESC, scheduledTime DESC, createdAt DESC');
        $stmt->execute([$userId]);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode(['appointments' => $appointments]);
        exit();
    }

    // Criar novo agendamento
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['message' => 'JSON inválido.']);
            exit();
        }

        $userId = $data['userId'] ?? null;
        $cpf = trim($data['cpf'] ?? '');
        $appointmentType = trim($data['appointmentType'] ?? '');
        $planType = trim($data['planType'] ?? '');
        $professional = trim($data['professional'] ?? '');
        $professionalCrm = trim($data['professionalCrm'] ?? '');
        $specialty = trim($data['specialty'] ?? '');
        $scheduledDate = trim($data['scheduledDate'] ?? '');
        $scheduledTime = trim($data['scheduledTime'] ?? '');
        $convenio = trim($data['convenio'] ?? '');
        $plan = trim($data['plan'] ?? '');
        $state = trim($data['state'] ?? '');
        $paymentMethod = trim($data['paymentMethod'] ?? '');
        $appointmentValue = isset($data['appointmentValue']) ? (float)$data['appointmentValue'] : null;

        if (!$userId || $appointmentType === '' || $planType === '' || $specialty === '' || $scheduledDate === '' || $scheduledTime === '' || $professional === '') {
            http_response_code(400);
            echo json_encode(['message' => 'Dados incompletos para agendamento.']);
            exit();
        }

        if ($planType === 'convenio' && ($convenio === '' || $plan === '')) {
            http_response_code(400);
            echo json_encode(['message' => 'Informe convênio e plano para agendamento por convênio.']);
            exit();
        }

        // RN01 - Unicidade de Horário: Um médico não pode ter duas consultas no mesmo horário e na mesma data
        $checkStmt = $pdo->prepare('SELECT id FROM appointments WHERE professional = ? AND scheduledDate = ? AND scheduledTime = ? AND status NOT IN ("cancelled", "faltou") LIMIT 1');
        $checkStmt->execute([$professional, $scheduledDate, $scheduledTime]);
        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode(['message' => 'Este médico já possui um agendamento para este horário e data.']);
            exit();
        }

        // Garantir que as colunas de pagamento existam (migração automática)
        ensureColumn($pdo, 'appointments', 'paymentMethod', 'TEXT');
        ensureColumn($pdo, 'appointments', 'appointmentValue', 'REAL');

        $stmt = $pdo->prepare('INSERT INTO appointments (
            userId, cpf, appointmentType, planType, state, professional, professional_crm,
            specialty, scheduledDate, scheduledTime, convenio, plan, paymentMethod, appointmentValue, status, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');
        $stmt->execute([
            $userId,
            $cpf,
            $appointmentType,
            $planType,
            $state,
            $professional,
            $professionalCrm,
            $specialty,
            $scheduledDate,
            $scheduledTime,
            $convenio !== '' ? $convenio : null,
            $plan !== '' ? $plan : null,
            $paymentMethod !== '' ? $paymentMethod : null,
            $appointmentValue,
            ($planType === 'particular' || $paymentMethod === 'convenio_billing') ? 'confirmed' : 'pending'
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Agendamento realizado com sucesso!',
            'appointmentId' => $pdo->lastInsertId()
        ]);
        exit();
    }

    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);
} catch (PDOException $e) {
    error_log('Erro no agendamento: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor ao processar agendamento.']);
}
?>
