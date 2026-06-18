<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    $method = $_SERVER['REQUEST_METHOD'];

    // GET - Listar anexos de um paciente
    if ($method === 'GET') {
        $userId = $_GET['userId'] ?? null;
        $appointmentId = $_GET['appointmentId'] ?? null;

        if (!$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'userId é obrigatório.']);
            exit();
        }

        if ($appointmentId) {
            $stmt = $pdo->prepare("
                SELECT * FROM patient_attachments
                WHERE userId = ? AND appointmentId = ?
                ORDER BY createdAt DESC
            ");
            $stmt->execute([$userId, $appointmentId]);
        } else {
            $stmt = $pdo->prepare("
                SELECT * FROM patient_attachments
                WHERE userId = ?
                ORDER BY createdAt DESC
                LIMIT 100
            ");
            $stmt->execute([$userId]);
        }

        $attachments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'message' => 'Anexos recuperados com sucesso.',
            'attachments' => $attachments ?: []
        ]);
        exit();
    }

    // POST - Fazer upload de anexo
    if ($method === 'POST') {
        $userId = $_POST['userId'] ?? null;
        $appointmentId = $_POST['appointmentId'] ?? null;
        $description = trim($_POST['description'] ?? '');
        $uploadedBy = $_POST['uploadedBy'] ?? 'patient';

        if (!$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'userId é obrigatório.']);
            exit();
        }

        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Arquivo não foi enviado.']);
            exit();
        }

        $file = $_FILES['file'];
        $fileName = $file['name'];
        $fileType = $file['type'];
        $fileSize = $file['size'];
        $fileTmpName = $file['tmp_name'];

        // Validações de arquivo
        $maxFileSize = 50 * 1024 * 1024; // 50 MB
        $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if ($fileSize > $maxFileSize) {
            http_response_code(413);
            echo json_encode(['message' => 'Arquivo excede o tamanho máximo de 50 MB.']);
            exit();
        }

        if (!in_array($fileType, $allowedTypes)) {
            http_response_code(415);
            echo json_encode(['message' => 'Tipo de arquivo não permitido. Aceitos: PDF, imagens, documentos Word.']);
            exit();
        }

        // Criar diretório se não existir
        $uploadDir = __DIR__ . '/../uploads/patient_attachments/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Gerar nome único para o arquivo
        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
        $uniqueFileName = uniqid('attach_') . '_' . time() . '.' . $fileExtension;
        $filePath = $uploadDir . $uniqueFileName;

        // Mover arquivo para o diretório de upload
        if (!move_uploaded_file($fileTmpName, $filePath)) {
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao salvar o arquivo.']);
            exit();
        }

        // Salvar informações no banco de dados
        $stmt = $pdo->prepare("
            INSERT INTO patient_attachments (userId, appointmentId, fileName, fileType, filePath, fileSize, description, uploadedBy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $userId,
            $appointmentId ?: null,
            $fileName,
            $fileType,
            '/uploads/patient_attachments/' . $uniqueFileName,
            $fileSize,
            $description ?: null,
            $uploadedBy
        ]);

        http_response_code(201);
        echo json_encode([
            'message' => 'Arquivo enviado com sucesso.',
            'attachmentId' => (int)$pdo->lastInsertId(),
            'filePath' => '/uploads/patient_attachments/' . $uniqueFileName
        ]);
        exit();
    }

    // DELETE - Remover anexo
    if ($method === 'DELETE') {
        $data = json_decode(file_get_contents('php://input'), true);
        $attachmentId = $data['attachmentId'] ?? null;
        $userId = $data['userId'] ?? null;

        if (!$attachmentId || !$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'attachmentId e userId são obrigatórios.']);
            exit();
        }

        // Verificar se o anexo pertence ao usuário
        $stmt = $pdo->prepare("SELECT filePath FROM patient_attachments WHERE id = ? AND userId = ?");
        $stmt->execute([$attachmentId, $userId]);
        $attachment = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$attachment) {
            http_response_code(404);
            echo json_encode(['message' => 'Anexo não encontrado ou acesso negado.']);
            exit();
        }

        // Deletar arquivo físico
        $filePath = __DIR__ . '/..' . $attachment['filePath'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        // Deletar registro do banco
        $deleteStmt = $pdo->prepare("DELETE FROM patient_attachments WHERE id = ?");
        $deleteStmt->execute([$attachmentId]);

        http_response_code(200);
        echo json_encode(['message' => 'Anexo removido com sucesso.']);
        exit();
    }

    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);

} catch (PDOException $e) {
    error_log('Erro ao processar anexos: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno do servidor ao processar anexos.']);
}
?>
