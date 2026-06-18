<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $userId = $_POST['userId'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'ID do usuário não fornecido.']);
            exit();
        }

        if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['message' => 'Nenhuma foto enviada ou erro no upload.']);
            exit();
        }

        $file = $_FILES['photo'];
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $detectedType = function_exists('mime_content_type') ? mime_content_type($file['tmp_name']) : ($file['type'] ?? '');
        
        if (!in_array($detectedType, $allowedTypes, true)) {
            http_response_code(400);
            echo json_encode(['message' => 'Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WEBP.']);
            exit();
        }

        // Limite de 2MB
        if ($file['size'] > 2 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['message' => 'A foto deve ter no máximo 2MB.']);
            exit();
        }

        // Criar diretório de uploads se não existir
        $uploadDir = __DIR__ . '/../../public/uploads/profiles/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Gerar nome único para o arquivo
        $extensionsByType = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp'
        ];
        $extension = $extensionsByType[$detectedType] ?? strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $fileName = 'profile_' . preg_replace('/[^0-9A-Za-z_-]/', '', (string) $userId) . '_' . time() . '.' . $extension;
        $targetPath = $uploadDir . $fileName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            // Salvar o caminho relativo no banco de dados
            $relativePath = '/uploads/profiles/' . $fileName;
            
            // Opcional: deletar foto antiga se existir
            $oldPhotoStmt = $pdo->prepare('SELECT profile_image FROM users WHERE id = ?');
            $oldPhotoStmt->execute([$userId]);
            $oldPhoto = $oldPhotoStmt->fetchColumn();
            
            if ($oldPhoto && $oldPhoto !== $relativePath) {
                $oldPath = __DIR__ . '/../../public' . $oldPhoto;
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }
            }

            $stmt = $pdo->prepare('UPDATE users SET profile_image = ? WHERE id = ?');
            $stmt->execute([$relativePath, $userId]);

            http_response_code(200);
            echo json_encode([
                'message' => 'Foto de perfil atualizada com sucesso!',
                'profile_image' => $relativePath
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Erro ao salvar o arquivo no servidor.']);
        }
        exit();
    }

    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro interno: ' . $e->getMessage()]);
}
?>
