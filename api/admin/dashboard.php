<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $pdo = getPDO();
    
    // Estatísticas Gerais
    $stats = [];
    
    // Total de Pacientes
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'patient'");
    $stats['totalPatients'] = (int)$stmt->fetchColumn();
    
    // Total de Agendamentos
    $stmt = $pdo->query("SELECT COUNT(*) FROM appointments");
    $stats['totalAppointments'] = (int)$stmt->fetchColumn();
    
    // Agendamentos Pendentes
    $stmt = $pdo->query("SELECT COUNT(*) FROM appointments WHERE status = 'pending'");
    $stats['pendingAppointments'] = (int)$stmt->fetchColumn();
    
    // Resultados de Exames
    $stmt = $pdo->query("SELECT COUNT(*) FROM exam_results");
    $stats['totalExams'] = (int)$stmt->fetchColumn();
    
    // Dados para o gráfico de Performance de Receita (últimos 6 meses)
    // Usa scheduledDate (data real da consulta) e soma o valor real de cada agendamento
    $revenueData = [];
    for ($i = 5; $i >= 0; $i--) {
        $month = date('Y-m', strtotime("-$i months"));
        $monthName = date('M/y', strtotime("-$i months"));
        
        // Soma appointmentValue quando disponível; fallback: consulta=250, reabilitação=180
        $stmt = $pdo->prepare("
            SELECT COALESCE(SUM(
                CASE
                    WHEN appointmentValue IS NOT NULL AND appointmentValue > 0 THEN appointmentValue
                    WHEN appointmentType = 'rehabilitation' THEN 180
                    ELSE 250
                END
            ), 0)
            FROM appointments
            WHERE (status = 'confirmed' OR status = 'finished')
              AND strftime('%Y-%m', scheduledDate) = ?
        ");
        $stmt->execute([$month]);
        $totalValue = (float)$stmt->fetchColumn();
        
        $revenueData[] = [
            'month' => $monthName,
            'value' => round($totalValue / 1000, 2) // Valor em milhares
        ];
    }
    
    // Dados para o gráfico de Distribuição por Especialidade
    $stmt = $pdo->query("SELECT specialty as name, COUNT(*) as value FROM appointments GROUP BY specialty");
    $specialtyDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($specialtyDistribution)) {
        $specialtyDistribution = [['name' => 'Neurologia', 'value' => 1]];
    }

    // Dados Financeiros - Receita de consultas
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(
            CASE
                WHEN appointmentValue IS NOT NULL AND appointmentValue > 0 THEN appointmentValue
                WHEN appointmentType = 'rehabilitation' THEN 180
                ELSE 250
            END
        ), 0)
        FROM appointments
        WHERE (status = 'confirmed' OR status = 'finished')
          AND strftime('%Y-%m', scheduledDate) = strftime('%Y-%m', 'now')
    ");
    $appointmentRevenue = (float)$stmt->fetchColumn();

    // Outras receitas (se houver)
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(amount), 0) 
        FROM financial_records 
        WHERE type = 'income' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    ");
    $otherRevenue = (float)$stmt->fetchColumn();
    $monthlyRevenue = $appointmentRevenue + $otherRevenue;
    
    // Despesas Reais da tabela financial_records
    $stmt = $pdo->query("
        SELECT COALESCE(SUM(amount), 0) 
        FROM financial_records 
        WHERE type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    ");
    $monthlyExpenses = (float)$stmt->fetchColumn();

    // Detalhes das despesas para o frontend
    $stmt = $pdo->query("
        SELECT category, SUM(amount) as value 
        FROM financial_records 
        WHERE type = 'expense' AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
        GROUP BY category
    ");
    $expenseDetails = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $netProfit = $monthlyRevenue - $monthlyExpenses;

    // Últimos Agendamentos ordenados por data de atendimento (scheduledDate)
    $stmt = $pdo->query("
        SELECT a.*, u.fullName as patientName, u.email as patientEmail,
               datetime(a.scheduledDate || 'T' || COALESCE(a.scheduledTime, '00:00')) as isoDate
        FROM appointments a 
        JOIN users u ON a.userId = u.id 
        ORDER BY a.scheduledDate DESC, a.scheduledTime DESC LIMIT 10
    ");
    $recentAppointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Lista de Pacientes Recentes com tratamento de data ISO 8601
    $stmt = $pdo->query("
        SELECT id, fullName, email, cpf, phone, datetime(createdAt) as isoDate 
        FROM users 
        WHERE role = 'patient' 
        ORDER BY createdAt DESC LIMIT 10
    ");
    $recentPatients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'stats' => $stats,
        'revenueData' => $revenueData,
        'specialtyDistribution' => $specialtyDistribution,
        'financials' => [
            'revenue' => $monthlyRevenue,
            'expenses' => $monthlyExpenses,
            'profit' => $netProfit,
            'expenseDetails' => $expenseDetails
        ],
        'recentAppointments' => $recentAppointments,
        'recentPatients' => $recentPatients
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Erro ao carregar dados do dashboard: ' . $e->getMessage()]);
}
?>
