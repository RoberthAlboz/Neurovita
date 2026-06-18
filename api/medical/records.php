<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    $method = $_SERVER['REQUEST_METHOD'];

    // GET - Recuperar prontuário de um paciente para uma consulta específica
    if ($method === 'GET') {
        $appointmentId = $_GET['appointmentId'] ?? null;
        $userId = $_GET['userId'] ?? null;

        if (!$appointmentId && !$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'appointmentId ou userId é obrigatório.']);
            exit();
        }

        if ($appointmentId) {
            $stmt = $pdo->prepare("
                SELECT mr.*, a.scheduledDate, a.scheduledTime, u.fullName as patientName
                FROM medical_records mr
                JOIN appointments a ON mr.appointmentId = a.id
                JOIN users u ON mr.userId = u.id
                WHERE mr.appointmentId = ?
                LIMIT 1
            ");
            $stmt->execute([$appointmentId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT mr.*, a.scheduledDate, a.scheduledTime, a.specialty
                FROM medical_records mr
                JOIN appointments a ON mr.appointmentId = a.id
                WHERE mr.userId = ?
                ORDER BY mr.createdAt DESC
                LIMIT 50
            ");
            $stmt->execute([$userId]);
        }

        $records = $appointmentId ? $stmt->fetch(PDO::FETCH_ASSOC) : $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'message' => 'Prontuário(s) recuperado(s) com sucesso.',
            'records' => $records ?: []
        ]);
        exit();
    }

    // POST - Criar novo prontuário
    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        $appointmentId = $data['appointmentId'] ?? null;
        $userId = $data['userId'] ?? null;
        $professionalId = $data['professionalId'] ?? null;
        $anamnesis = trim($data['anamnesis'] ?? '');
        $physicalExamination = trim($data['physicalExamination'] ?? '');
        $diagnosticHypothesis = trim($data['diagnosticHypothesis'] ?? '');
        $cid10Code = trim($data['cid10Code'] ?? '');
        $prescription = trim($data['prescription'] ?? '');
        $clinicalEvolution = trim($data['clinicalEvolution'] ?? '');
        $notes = trim($data['notes'] ?? '');

        if (!$appointmentId || !$userId || !$professionalId) {
            http_response_code(400);
            echo json_encode(['message' => 'appointmentId, userId e professionalId são obrigatórios.']);
            exit();
        }

        // Verificar se já existe prontuário para este agendamento
        $checkStmt = $pdo->prepare("SELECT id FROM medical_records WHERE appointmentId = ? LIMIT 1");
        $checkStmt->execute([$appointmentId]);
        if ($checkStmt->fetch()) {
            http_response_code(409);
            echo json_encode(['message' => 'Já existe um prontuário para este agendamento.']);
            exit();
        }

        $stmt = $pdo->prepare("
            INSERT INTO medical_records (
                appointmentId, userId, professionalId, anamnesis, physicalExamination,
                diagnosticHypothesis, cid10Code, prescription, clinicalEvolution, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $appointmentId,
            $userId,
            $professionalId,
            $anamnesis ?: null,
            $physicalExamination ?: null,
            $diagnosticHypothesis ?: null,
            $cid10Code ?: null,
            $prescription ?: null,
            $clinicalEvolution ?: null,
            $notes ?: null
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Prontuário criado com sucesso.',
            'recordId' => (int)$pdo->lastInsertId()
        ]);
        exit();
    }

    // PUT - Atualizar prontuário existente
    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);

        $recordId = $data['recordId'] ?? null;
        $anamnesis = trim($data['anamnesis'] ?? '');
        $physicalExamination = trim($data['physicalExamination'] ?? '');
        $diagnosticHypothesis = trim($data['diagnosticHypothesis'] ?? '');
        $cid10Code = trim($data['cid10Code'] ?? '');
        $prescription = trim($data['prescription'] ?? '');
        $clinicalEvolution = trim($data['clinicalEvolution'] ?? '');
        $notes = trim($data['notes'] ?? '');

        if (!$recordId) {
            http_response_code(400);
            echo json_encode(['message' => 'recordId é obrigatório.']);
            exit();
        }

        $stmt = $pdo->prepare("
            UPDATE medical_records SET
                anamnesis = ?,
                physicalExamination = ?,
                diagnosticHypothesis = ?,
                cid10Code = ?,
                prescription = ?,
                clinicalEvolution = ?,
                notes = ?,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        ");

        $stmt->execute([
            $anamnesis ?: null,
            $physicalExamination ?: null,
            $diagnosticHypothesis ?: null,
            $cid10Code ?: null,
            $prescription ?: null,
            $clinicalEvolution ?: null,
            $notes ?: null,
            $recordId
        ]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['message' => 'Prontuário não encontrado.']);
            exit();
        }

        http_response_code(200);
        echo json_encode(['message' => 'Prontuário atualizado com sucesso.']);
        exit();
    }

    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);

} catch (PDOException $e) {
    error_log('Erro ao processar prontuário: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor ao processar prontuário.']);
}
?>
