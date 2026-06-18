import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / 'api' / 'database.sqlite'

schema_statements = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        cpf TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        isActive INTEGER DEFAULT 1
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS login_sessions (
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
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        cpf TEXT NOT NULL,
        appointmentType TEXT NOT NULL,
        planType TEXT NOT NULL,
        state TEXT NOT NULL,
        specialty TEXT NOT NULL,
        convenio TEXT,
        plan TEXT,
        laboratoryName TEXT,
        scheduledDate DATETIME,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS exam_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        examType TEXT NOT NULL,
        laboratoryName TEXT NOT NULL,
        resultDate DATETIME NOT NULL,
        resultFile TEXT,
        status TEXT DEFAULT 'available',
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
    """,
]

required_appointment_columns = {
    'cpf': "TEXT",
    'appointmentType': "TEXT",
    'planType': "TEXT",
    'state': "TEXT",
    'specialty': "TEXT",
    'convenio': "TEXT",
    'plan': "TEXT",
    'laboratoryName': "TEXT",
    'scheduledDate': "DATETIME",
    'status': "TEXT DEFAULT 'pending'",
    'notes': "TEXT",
    'updatedAt': "DATETIME DEFAULT CURRENT_TIMESTAMP",
}

index_statements = [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf)',
    'CREATE INDEX IF NOT EXISTS idx_sessions_user ON login_sessions(userId)',
    'CREATE INDEX IF NOT EXISTS idx_appointments_user ON appointments(userId)',
    'CREATE INDEX IF NOT EXISTS idx_results_user ON exam_results(userId)',
]

with sqlite3.connect(DB_PATH) as conn:
    conn.execute('PRAGMA foreign_keys = ON')
    for statement in schema_statements:
        conn.execute(statement)

    existing = {row[1] for row in conn.execute('PRAGMA table_info(appointments)')}
    for column, definition in required_appointment_columns.items():
        if column not in existing:
            conn.execute(f'ALTER TABLE appointments ADD COLUMN {column} {definition}')

    for statement in index_statements:
        conn.execute(statement)

    conn.commit()

print(f'Banco migrado com sucesso: {DB_PATH}')
