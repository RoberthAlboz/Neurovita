<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Listar todas as sessões ativas
        $stmt = $pdo->query("
            SELECT ls.id, ls.userId, u.fullName, u.email, ls.loginAt, ls.userAgent, ls.ipAddress
            FROM login_sessions ls
            JOIN users u ON ls.userId = u.id
            WHERE ls.isActive = 1
            ORDER BY ls.loginAt DESC
        ");
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'success',
            'sessions' => $sessions,
            'total' => count($sessions)
        ]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        // Encerrar uma sessão específica
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['sessionId'])) {
            http_response_code(400);
            echo json_encode(['message' => 'sessionId é obrigatório']);
            exit();
        }
        
        $stmt = $pdo->prepare("UPDATE login_sessions SET isActive = 0, logoutAt = CURRENT_TIMESTAMP WHERE id = ?");
        $stmt->execute([$data['sessionId']]);
        
        echo json_encode(['status' => 'success', 'message' => 'Sessão encerrada']);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'terminate_all') {
        // Encerrar todas as sessões
        $stmt = $pdo->prepare("UPDATE login_sessions SET isActive = 0, logoutAt = CURRENT_TIMESTAMP WHERE isActive = 1");
        $stmt->execute();
        
        echo json_encode(['status' => 'success', 'message' => 'Todas as sessões foram encerradas']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro ao gerenciar sessões: ' . $e->getMessage()]);
}
?>
