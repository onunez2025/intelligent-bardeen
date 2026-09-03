const sql = require('mssql');

const config = {
  user: 'soledbserveradmin',
  password: '@s0le@dm1nAI#82,',
  server: 'soledbserver.database.windows.net',
  database: 'soledb-puntoventa',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function setupDatabase() {
  console.log('Conectando a Azure SQL Server (soledbserver.database.windows.net)...');
  
  try {
    const pool = await sql.connect(config);
    console.log('¡Conexión exitosa a Azure SQL Server!');

    // 1. Crear Schema ti_projects si no existe
    console.log('Verificando esquema ti_projects...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'ti_projects')
      BEGIN
        EXEC('CREATE SCHEMA ti_projects')
        PRINT 'Esquema ti_projects creado.'
      END
      ELSE
      BEGIN
        PRINT 'El esquema ti_projects ya existe.'
      END
    `);

    // 2. Crear Tabla Projects
    console.log('Creando tabla ti_projects.Projects...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ti_projects.Projects') AND type in (N'U'))
      BEGIN
        CREATE TABLE ti_projects.Projects (
          id NVARCHAR(100) PRIMARY KEY,
          code NVARCHAR(50) UNIQUE NOT NULL,
          name NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          category NVARCHAR(50) DEFAULT 'OTHER',
          status NVARCHAR(50) DEFAULT 'BACKLOG',
          solutionType NVARCHAR(50) DEFAULT 'INTEGRATION_EXISTING',
          targetSystems NVARCHAR(MAX), -- JSON string array
          attachments NVARCHAR(MAX),   -- JSON string array
          requesterName NVARCHAR(150),
          requesterEmail NVARCHAR(150),
          requesterDepartment NVARCHAR(150),
          specialistId NVARCHAR(100),
          specialistName NVARCHAR(150),
          startDate DATE,
          targetEndDate DATE,
          actualEndDate DATE,
          repositoryUrl NVARCHAR(500),
          documentationUrl NVARCHAR(500),
          deploymentUrl NVARCHAR(500),
          estimatedHours FLOAT DEFAULT 0,
          actualHours FLOAT DEFAULT 0,
          hourlyRate FLOAT DEFAULT 18,
          savedHoursMonth FLOAT DEFAULT 0,
          savedMoneyMonth FLOAT DEFAULT 0,
          directCostSavingsYear FLOAT DEFAULT 0,
          roiSummary NVARCHAR(MAX),
          manualProgress INT DEFAULT 0,
          aiEstimatedProgress INT,
          aiProgressAnalysis NVARCHAR(MAX),
          lastAiEvaluationAt DATETIME,
          requestId NVARCHAR(100),
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME DEFAULT GETDATE()
        );
        PRINT 'Tabla ti_projects.Projects creada exitosamente.';
      END
    `);

    // 3. Crear Tabla Requests
    console.log('Creando tabla ti_projects.Requests...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ti_projects.Requests') AND type in (N'U'))
      BEGIN
        CREATE TABLE ti_projects.Requests (
          id NVARCHAR(100) PRIMARY KEY,
          code NVARCHAR(50) UNIQUE NOT NULL,
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          businessPain NVARCHAR(MAX),
          estimatedImpact NVARCHAR(MAX),
          urgency NVARCHAR(50) DEFAULT 'MEDIUM',
          status NVARCHAR(50) DEFAULT 'SUBMITTED',
          solutionType NVARCHAR(50) DEFAULT 'INTEGRATION_EXISTING',
          targetSystems NVARCHAR(MAX),
          attachments NVARCHAR(MAX),
          requesterName NVARCHAR(150),
          requesterEmail NVARCHAR(150),
          requesterDepartment NVARCHAR(150),
          aiCategory NVARCHAR(50),
          aiAnalysis NVARCHAR(MAX),
          aiRecommendedQuestions NVARCHAR(MAX),
          projectId NVARCHAR(100),
          createdAt DATETIME DEFAULT GETDATE(),
          updatedAt DATETIME DEFAULT GETDATE()
        );
        PRINT 'Tabla ti_projects.Requests creada exitosamente.';
      END
    `);

    // 4. Crear Tabla Tasks
    console.log('Creando tabla ti_projects.Tasks...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ti_projects.Tasks') AND type in (N'U'))
      BEGIN
        CREATE TABLE ti_projects.Tasks (
          id NVARCHAR(100) PRIMARY KEY,
          projectId NVARCHAR(100) NOT NULL FOREIGN KEY REFERENCES ti_projects.Projects(id) ON DELETE CASCADE,
          title NVARCHAR(255) NOT NULL,
          description NVARCHAR(MAX),
          isCompleted BIT DEFAULT 0,
          [order] INT DEFAULT 0,
          createdAt DATETIME DEFAULT GETDATE()
        );
        PRINT 'Tabla ti_projects.Tasks creada exitosamente.';
      END
    `);

    // 5. Crear Tabla ProjectNotes
    console.log('Creando tabla ti_projects.ProjectNotes...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ti_projects.ProjectNotes') AND type in (N'U'))
      BEGIN
        CREATE TABLE ti_projects.ProjectNotes (
          id NVARCHAR(100) PRIMARY KEY,
          projectId NVARCHAR(100) NOT NULL FOREIGN KEY REFERENCES ti_projects.Projects(id) ON DELETE CASCADE,
          title NVARCHAR(255) NOT NULL,
          content NVARCHAR(MAX),
          author NVARCHAR(150),
          createdAt DATETIME DEFAULT GETDATE()
        );
        PRINT 'Tabla ti_projects.ProjectNotes creada exitosamente.';
      END
    `);

    // 6. Crear Tabla ProgressLogs
    console.log('Creando tabla ti_projects.ProgressLogs...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'ti_projects.ProgressLogs') AND type in (N'U'))
      BEGIN
        CREATE TABLE ti_projects.ProgressLogs (
          id NVARCHAR(100) PRIMARY KEY,
          projectId NVARCHAR(100) NOT NULL FOREIGN KEY REFERENCES ti_projects.Projects(id) ON DELETE CASCADE,
          repoNotes NVARCHAR(MAX),
          aiProgressScore INT,
          aiFeedback NVARCHAR(MAX),
          createdAt DATETIME DEFAULT GETDATE()
        );
        PRINT 'Tabla ti_projects.ProgressLogs creada exitosamente.';
      END
    `);

    console.log('\n--- VERIFICACIÓN DE TABLAS CREADAS EN ti_projects ---');
    const result = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'ti_projects'
    `);
    console.table(result.recordset);

    console.log('\n¡TODAS LAS TABLAS DE TI FUERON CREADAS Y AISLADAS EN ti_projects CORRECTAMENTE!');
    process.exit(0);
  } catch (err) {
    console.error('Error durante la configuración de la BD:', err);
    process.exit(1);
  }
}

setupDatabase();
