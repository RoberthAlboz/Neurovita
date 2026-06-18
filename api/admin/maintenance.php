<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    
    // Verificar se o modo manutenção está ativo
    $stmt = $pdo->prepare("SELECT value FROM app_settings WHERE key = 'maintenanceMode'");
    $stmt->execute();
    $maintenanceMode = $stmt->fetchColumn();
    
    // Se modo manutenção está ativo, verificar se o userId informado é admin no banco
    if ($maintenanceMode === '1') {
        $userId = $_GET['userId'] ?? null;
        $isAdmin = false;

        if ($userId) {
            $stmtUser = $pdo->prepare("SELECT role FROM users WHERE id = ? LIMIT 1");
            $stmtUser->execute([$userId]);
            $userRole = $stmtUser->fetchColumn();
            $isAdmin = ($userRole === 'admin');
        }
        
        if (!$isAdmin) {
            http_response_code(503);
            echo json_encode([
                'status' => 'maintenance',
                'message' => 'A plataforma está em manutenção. Tente novamente em breve.'
            ]);
            exit();
        }
    }
    
    echo json_encode([
        'status' => 'ok',
        'maintenanceMode' => (bool)$maintenanceMode
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro ao verificar status: ' . $e->getMessage()]);
}
?>
