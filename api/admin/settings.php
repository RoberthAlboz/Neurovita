<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT key, value FROM app_settings");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Tipagem correta para o frontend
        $formattedSettings = [];
        foreach ($settings as $key => $value) {
            if ($value === '1' || $value === '0') {
                $formattedSettings[$key] = $value === '1';
            } elseif (is_numeric($value)) {
                $formattedSettings[$key] = strpos($value, '.') !== false ? (float)$value : (int)$value;
            } else {
                $formattedSettings[$key] = $value;
            }
        }
        
        echo json_encode([
            'status' => 'success',
            'settings' => $formattedSettings
        ]);
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !is_array($data)) {
            http_response_code(400);
            echo json_encode(['message' => 'Dados inválidos']);
            exit();
        }
        
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)");
        
        foreach ($data as $key => $value) {
            // Ignorar campos que não devem ser salvos na tabela de settings (como campos de perfil)
            $ignoredKeys = ['fullName', 'email', 'phone', 'profileImage', 'userId'];
            if (in_array($key, $ignoredKeys)) continue;

            $valToStore = is_bool($value) ? ($value ? '1' : '0') : (string)$value;
            $stmt->execute([$key, $valToStore]);
        }
        
        $pdo->commit();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Configurações sincronizadas com o banco de dados'
        ]);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['message' => 'Erro no banco de dados: ' . $e->getMessage()]);
}
?>
