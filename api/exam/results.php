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

        $stmt = $pdo->prepare('
            SELECT
                id,
                examType,
                COALESCE(notes, resultFile, "Resultado disponível") AS result,
                DATE(resultDate) AS date,
                status
            FROM exam_results
            WHERE userId = ?
            ORDER BY resultDate DESC, createdAt DESC
            LIMIT 50
        ');
        $stmt->execute([$userId]);
        $exams = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'message' => 'Resultados de exames encontrados.',
            'exams' => $exams ?: []
        ]);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!is_array($data)) {
            http_response_code(400);
            echo json_encode(['message' => 'JSON inválido.']);
            exit();
        }

        $userId = $data['userId'] ?? null;
        $examType = trim($data['examType'] ?? '');
        $result = trim($data['result'] ?? $data['notes'] ?? '');
        $date = trim($data['date'] ?? $data['resultDate'] ?? date('Y-m-d'));
        $status = trim($data['status'] ?? 'available');
        $laboratoryName = trim($data['laboratoryName'] ?? 'Neurovita');
        $resultFile = trim($data['resultFile'] ?? '');

        if (!$userId || $examType === '' || $result === '') {
            http_response_code(400);
            echo json_encode(['message' => 'Dados incompletos para criar resultado de exame.']);
            exit();
        }

        $stmt = $pdo->prepare('
            INSERT INTO exam_results (userId, examType, laboratoryName, resultDate, resultFile, status, notes, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ');
        $stmt->execute([
            $userId,
            $examType,
            $laboratoryName !== '' ? $laboratoryName : 'Neurovita',
            $date,
            $resultFile !== '' ? $resultFile : null,
            $status !== '' ? $status : 'available',
            $result
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Resultado de exame criado com sucesso.',
            'examId' => $pdo->lastInsertId()
        ]);
        exit();
    }

    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);
} catch (PDOException $e) {
    error_log('Erro ao processar resultados de exames: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor ao processar exames.']);
} catch (Exception $e) {
    error_log('Erro inesperado: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro inesperado.']);
}
?>
