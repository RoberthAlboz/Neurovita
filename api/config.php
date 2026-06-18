<?php
/**
 * Configuração de Conexão SQLite - Neurovita
 *
 * Além de abrir a conexão, este arquivo mantém o schema mínimo da aplicação
 * sincronizado para evitar erros quando o banco local ainda não foi migrado.
 */

// Caminho absoluto para o banco de dados
$db_file = __DIR__ . DIRECTORY_SEPARATOR . 'database.sqlite';

// Headers CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT, PATCH");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'CLI';
if ($requestMethod === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Retorna uma instância do PDO conectada ao SQLite.
 */
function getPDO() {
    global $db_file;

    if (!in_array('sqlite', PDO::getAvailableDrivers(), true)) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Driver SQLite não está habilitado no seu PHP. Ative 'extension=pdo_sqlite' no seu php.ini"
        ]);
        exit();
    }

    try {
        $pdo = new PDO("sqlite:" . $db_file);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA foreign_keys = ON');

        ensureCoreSchema($pdo);

        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Erro na conexão com SQLite: " . $e->getMessage(),
            "path" => $db_file
        ]);
        exit();
    }
}

function tableExists(PDO $pdo, string $tableName): bool {
    $stmt = $pdo->prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?");
    $stmt->execute([$tableName]);
    return (bool) $stmt->fetchColumn();
}

function columnExists(PDO $pdo, string $tableName, string $columnName): bool {
    if (!tableExists($pdo, $tableName)) {
        return false;
    }

    $columns = $pdo->query("PRAGMA table_info($tableName)")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $column) {
        if (($column['name'] ?? '') === $columnName) {
            return true;
        }
    }
    return false;
}

function ensureColumn(PDO $pdo, string $tableName, string $columnName, string $definition): void {
    if (!columnExists($pdo, $tableName, $columnName)) {
        $pdo->exec("ALTER TABLE $tableName ADD COLUMN $columnName $definition");
    }
}

/**
 * Cria e migra as tabelas essenciais usadas pelo frontend e pelos endpoints PHP.
 */
function ensureCoreSchema(PDO $pdo): void {
    static $alreadyEnsured = false;
    if ($alreadyEnsured) {
        return;
    }
    $alreadyEnsured = true;

    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        cpf TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        isActive INTEGER DEFAULT 1,
        role TEXT DEFAULT 'patient',
        profile_image TEXT
    )");

    ensureColumn($pdo, 'users', 'role', "TEXT DEFAULT 'patient'");
    ensureColumn($pdo, 'users', 'profile_image', 'TEXT');
    ensureColumn($pdo, 'users', 'updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    ensureColumn($pdo, 'users', 'isActive', 'INTEGER DEFAULT 1');

    $pdo->exec("CREATE TABLE IF NOT EXISTS login_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        loginMethod TEXT NOT NULL,
        loginIdentifier TEXT NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        loginAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        logoutAt DATETIME,
        isActive INTEGER DEFAULT 1,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        cpf TEXT,
        appointmentType TEXT NOT NULL,
        planType TEXT,
        state TEXT,
        specialty TEXT NOT NULL,
        professional TEXT,
        professional_crm TEXT,
        convenio TEXT,
        plan TEXT,
        laboratoryName TEXT,
        scheduledDate DATETIME,
        scheduledTime TEXT,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )");

    $appointmentColumns = [
        'cpf' => 'TEXT',
        'appointmentType' => 'TEXT',
        'planType' => 'TEXT',
        'state' => 'TEXT',
        'specialty' => 'TEXT',
        'professional' => 'TEXT',
        'professional_crm' => 'TEXT',
        'convenio' => 'TEXT',
        'plan' => 'TEXT',
        'paymentMethod' => 'TEXT',
        'appointmentValue' => 'REAL',
        'laboratoryName' => 'TEXT',
        'scheduledDate' => 'DATETIME',
        'scheduledTime' => 'TEXT',
        'status' => "TEXT DEFAULT 'pending'",
        'notes' => 'TEXT',
        'createdAt' => 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        'updatedAt' => 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    ];
    foreach ($appointmentColumns as $column => $definition) {
        ensureColumn($pdo, 'appointments', $column, $definition);
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS exam_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        examType TEXT NOT NULL,
        laboratoryName TEXT NOT NULL DEFAULT 'Neurovita',
        resultDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        resultFile TEXT,
        status TEXT DEFAULT 'available',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )");

    $examColumns = [
        'userId' => 'INTEGER',
        'examType' => 'TEXT',
        'laboratoryName' => "TEXT NOT NULL DEFAULT 'Neurovita'",
        'resultDate' => 'DATETIME',
        'resultFile' => 'TEXT',
        'status' => "TEXT DEFAULT 'available'",
        'notes' => 'TEXT',
        'createdAt' => 'DATETIME DEFAULT CURRENT_TIMESTAMP'
    ];
    foreach ($examColumns as $column => $definition) {
        ensureColumn($pdo, 'exam_results', $column, $definition);
    }

    $pdo->exec("CREATE TABLE IF NOT EXISTS specialties (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        description TEXT,
        icon TEXT DEFAULT 'Brain',
        iconColor TEXT DEFAULT '#4361EE',
        image TEXT
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS professionals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT,
        rating REAL DEFAULT 5.0,
        crm TEXT,
        image TEXT,
        specialtyId TEXT NOT NULL,
        FOREIGN KEY (specialtyId) REFERENCES specialties(id) ON DELETE CASCADE
    )");

    $pdo->exec("CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )");

    // Tabela de Prontuarios Eletronicos (EHR)
    $pdo->exec("CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appointmentId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        professionalId TEXT NOT NULL,
        anamnesis TEXT,
        physicalExamination TEXT,
        diagnosticHypothesis TEXT,
        cid10Code TEXT,
        prescription TEXT,
        clinicalEvolution TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Tabela de Termos de Consentimento (LGPD)
    $pdo->exec("CREATE TABLE IF NOT EXISTS consent_terms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        termType TEXT NOT NULL,
        termVersion TEXT DEFAULT '1.0',
        accepted BOOLEAN DEFAULT 0,
        acceptedAt DATETIME,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )");

    // Tabela de Anexos de Pacientes (Upload de Exames Anteriores)
    $pdo->exec("CREATE TABLE IF NOT EXISTS patient_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        appointmentId INTEGER,
        fileName TEXT NOT NULL,
        fileType TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileSize INTEGER,
        description TEXT,
        uploadedBy TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE SET NULL
    )");

    // Tabela de Registros Financeiros (Despesas e Receitas Extras)
    $pdo->exec("CREATE TABLE IF NOT EXISTS financial_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL, -- 'income' ou 'expense'
        category TEXT NOT NULL, -- 'Aluguel', 'Salários', 'Insumos', etc.
        description TEXT,
        amount REAL NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        status TEXT DEFAULT 'paid', -- 'paid', 'pending'
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // Inserir algumas despesas de exemplo se a tabela estiver vazia
    $stmt = $pdo->query("SELECT COUNT(*) FROM financial_records");
    if ((int)$stmt->fetchColumn() === 0) {
        $expenses = [
            ['expense', 'Aluguel', 'Aluguel da Clínica', 2500.00, date('Y-m-01')],
            ['expense', 'Energia', 'Conta de Luz', 450.00, date('Y-m-05')],
            ['expense', 'Internet', 'Link Dedicado', 200.00, date('Y-m-10')],
            ['expense', 'Limpeza', 'Serviços de Terceiros', 800.00, date('Y-m-15')],
            ['expense', 'Insumos', 'Materiais de Escritório', 350.00, date('Y-m-20')]
        ];
        $insert = $pdo->prepare("INSERT INTO financial_records (type, category, description, amount, date) VALUES (?, ?, ?, ?, ?)");
        foreach ($expenses as $expense) {
            $insert->execute($expense);
        }
    }

    // Inserir configurações padrão se não existirem
    $defaultSettings = [
        'clinicName' => 'Clínica Neurovita',
        'address' => 'Av. Paulista, 1000 - São Paulo, SP',
        'phone' => '(11) 3000-0000',
        'email' => 'contato@neurovita.com.br',
        'notificationsEmail' => '1',
        'notificationsSMS' => '0',
        'backupDaily' => '1',
        'maintenanceMode' => '0',
        'debugMode' => '0',
        'autoBackup' => '1',
        'backupFrequency' => 'daily',
        'maxSessions' => '10',
        'sessionTimeout' => '30'
    ];

    foreach ($defaultSettings as $key => $value) {
        $stmt = $pdo->prepare("INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)");
        $stmt->execute([$key, $value]);
    }

    seedDefaultContent($pdo);

    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_sessions_user ON login_sessions(userId)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(userId)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_results_user ON exam_results(userId)");

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    $stmt->execute();
    if ((int) $stmt->fetchColumn() === 0) {
        $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $insert = $pdo->prepare("INSERT OR IGNORE INTO users (fullName, email, cpf, phone, password, role) VALUES (?, ?, ?, ?, ?, 'admin')");
        $insert->execute(['Administrador Neurovita', 'admin@neurovita.com.br', '000.000.000-00', '(00) 00000-0000', $adminPassword]);
    }
}

function seedDefaultContent(PDO $pdo): void {
    // CORREÇÃO DAS IMAGENS: Mapeamento corrigido conforme feedback do usuário
    $specialties = [
        ['neuro-geral', 'Neurologia Geral', 'consulta', 'Avaliação, diagnóstico e acompanhamento de condições neurológicas em adultos.', 'Brain', '#4361EE', '/assets/images/neurologia-geral.png'],
        ['neuro-cirurgia', 'Neurocirurgia', 'consulta', 'Acompanhamento especializado para casos cirúrgicos e avaliação neurofuncional.', 'Activity', '#2D5D7B', '/assets/images/fotoradiografia.png'],
        ['neuro-pediatria', 'Neuropediatria', 'consulta', 'Cuidado neurológico para crianças e adolescentes com abordagem humanizada.', 'Heart', '#9191E9', '/assets/images/ortopediatri-cocuk-ortopedi-akademisi-iKCuym5Kt5o-unsplash.jpg']
    ];

    // Limpar e reinserir especialidades para garantir a correção das imagens
    $pdo->exec("DELETE FROM specialties");
    $stmt = $pdo->prepare("INSERT INTO specialties (id, title, subtitle, description, icon, iconColor, image) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($specialties as $specialty) {
        $stmt->execute($specialty);
    }

    // Inserir especialidade de reabilitação silenciosamente (para manter integridade referencial, mas não aparece na lista de consultas)
    $stmt->execute(['reabilitacao', 'Reabilitação Neurológica', 'reabilitação', 'Programa multidisciplinar para recuperação.', 'Zap', '#C2AFF0', '/assets/images/reabilitacao-neurologica.jpg']);

    $professionals = [
        ['ana-luiza', 'Dra. Ana Luiza Martins', 'Neurologista Clínica', 4.9, 'CRM 12345-SP', '/assets/images/dra-ana-luiza.png', 'neuro-geral'],
        ['rafael-monteiro', 'Dr. Rafael Monteiro', 'Neurocirurgião', 4.8, 'CRM 23456-SP', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200&h=200', 'neuro-cirurgia'],
        ['mariana-costa', 'Dra. Mariana Costa', 'Neuropediatra', 4.9, 'CRM 34567-SP', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=200&h=200', 'neuro-pediatria'],
        ['sofia-navarro', 'Dra. Sofia Navarro', 'Fisioterapeuta Neurofuncional', 5.0, 'CREFITO 45678-F', '/assets/images/sofia-navarro.jpg', 'reabilitacao']
    ];

    // Limpar e reinserir profissionais para garantir a correção e adição da Dra. Sofia Navarro
    $pdo->exec("DELETE FROM professionals");
    $stmt = $pdo->prepare("INSERT INTO professionals (id, name, role, rating, crm, image, specialtyId) VALUES (?, ?, ?, ?, ?, ?, ?)");
    foreach ($professionals as $professional) {
        $stmt->execute($professional);
    }
}



// Conexão global para compatibilidade com scripts antigos
$conn = getPDO();
?>
