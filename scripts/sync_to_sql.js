const sql = require('mssql');
const fs = require('fs');
const path = require('path');

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

const DATA_DIR = path.join(process.cwd(), '.data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');

async function syncDataToSQL() {
  console.log('Conectando a Azure SQL Server para sincronizar datos...');
  
  try {
    const pool = await sql.connect(config);
    console.log('¡Conectado exitosamente!');

    const projects = JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
    const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8'));

    console.log(`Sincronizando ${projects.length} proyectos a ti_projects.Projects...`);

    for (const p of projects) {
      const targetSystemsJson = JSON.stringify(p.targetSystems || []);
      const attachmentsJson = JSON.stringify(p.attachments || []);

      await pool.request()
        .input('id', sql.NVarChar(100), p.id)
        .input('code', sql.NVarChar(50), p.code)
        .input('name', sql.NVarChar(255), p.name)
        .input('description', sql.NVarChar(sql.MAX), p.description || '')
        .input('category', sql.NVarChar(50), p.category || 'OTHER')
        .input('status', sql.NVarChar(50), p.status || 'BACKLOG')
        .input('solutionType', sql.NVarChar(50), p.solutionType || 'INTEGRATION_EXISTING')
        .input('targetSystems', sql.NVarChar(sql.MAX), targetSystemsJson)
        .input('attachments', sql.NVarChar(sql.MAX), attachmentsJson)
        .input('requesterName', sql.NVarChar(150), p.requesterName || '')
        .input('requesterEmail', sql.NVarChar(150), p.requesterEmail || '')
        .input('requesterDepartment', sql.NVarChar(150), p.requesterDepartment || '')
        .input('specialistId', sql.NVarChar(100), p.specialistId || 'user-onunez')
        .input('specialistName', sql.NVarChar(150), p.specialistName || 'Orlando Núñez')
        .input('startDate', sql.Date, p.startDate ? new Date(p.startDate) : new Date())
        .input('targetEndDate', sql.Date, p.targetEndDate ? new Date(p.targetEndDate) : new Date())
        .input('repositoryUrl', sql.NVarChar(500), p.repositoryUrl || '')
        .input('documentationUrl', sql.NVarChar(500), p.documentationUrl || '')
        .input('deploymentUrl', sql.NVarChar(500), p.deploymentUrl || '')
        .input('estimatedHours', sql.Float, p.estimatedHours || 0)
        .input('actualHours', sql.Float, p.actualHours || 0)
        .input('hourlyRate', sql.Float, p.hourlyRate || 18)
        .input('savedHoursMonth', sql.Float, p.savedHoursMonth || 0)
        .input('savedMoneyMonth', sql.Float, p.savedMoneyMonth || 0)
        .input('directCostSavingsYear', sql.Float, p.directCostSavingsYear || 0)
        .input('roiSummary', sql.NVarChar(sql.MAX), p.roiSummary || '')
        .input('manualProgress', sql.Int, p.manualProgress || 0)
        .input('aiEstimatedProgress', sql.Int, p.aiEstimatedProgress || 0)
        .input('aiProgressAnalysis', sql.NVarChar(sql.MAX), p.aiProgressAnalysis || '')
        .input('requestId', sql.NVarChar(100), p.requestId || null)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM ti_projects.Projects WHERE id = @id)
          BEGIN
            INSERT INTO ti_projects.Projects (
              id, code, name, description, category, status, solutionType, targetSystems, attachments,
              requesterName, requesterEmail, requesterDepartment, specialistId, specialistName,
              startDate, targetEndDate, repositoryUrl, documentationUrl, deploymentUrl,
              estimatedHours, actualHours, hourlyRate, savedHoursMonth, savedMoneyMonth, directCostSavingsYear,
              roiSummary, manualProgress, aiEstimatedProgress, aiProgressAnalysis, requestId
            ) VALUES (
              @id, @code, @name, @description, @category, @status, @solutionType, @targetSystems, @attachments,
              @requesterName, @requesterEmail, @requesterDepartment, @specialistId, @specialistName,
              @startDate, @targetEndDate, @repositoryUrl, @documentationUrl, @deploymentUrl,
              @estimatedHours, @actualHours, @hourlyRate, @savedHoursMonth, @savedMoneyMonth, @directCostSavingsYear,
              @roiSummary, @manualProgress, @aiEstimatedProgress, @aiProgressAnalysis, @requestId
            )
          END
          ELSE
          BEGIN
            UPDATE ti_projects.Projects SET
              code = @code, name = @name, description = @description, category = @category, status = @status,
              solutionType = @solutionType, targetSystems = @targetSystems, attachments = @attachments,
              requesterName = @requesterName, requesterEmail = @requesterEmail, requesterDepartment = @requesterDepartment,
              startDate = @startDate, targetEndDate = @targetEndDate, repositoryUrl = @repositoryUrl,
              savedHoursMonth = @savedHoursMonth, savedMoneyMonth = @savedMoneyMonth,
              manualProgress = @manualProgress, aiEstimatedProgress = @aiEstimatedProgress,
              updatedAt = GETDATE()
            WHERE id = @id
          END
        `);

      // Tareas del proyecto
      if (p.tasks && p.tasks.length > 0) {
        for (const t of p.tasks) {
          await pool.request()
            .input('id', sql.NVarChar(100), t.id)
            .input('projectId', sql.NVarChar(100), p.id)
            .input('title', sql.NVarChar(255), t.title)
            .input('isCompleted', sql.Bit, t.isCompleted ? 1 : 0)
            .input('order', sql.Int, t.order || 0)
            .query(`
              IF NOT EXISTS (SELECT 1 FROM ti_projects.Tasks WHERE id = @id)
              BEGIN
                INSERT INTO ti_projects.Tasks (id, projectId, title, isCompleted, [order])
                VALUES (@id, @projectId, @title, @isCompleted, @order)
              END
            `);
        }
      }

      // Notas del proyecto
      if (p.notes && p.notes.length > 0) {
        for (const n of p.notes) {
          await pool.request()
            .input('id', sql.NVarChar(100), n.id)
            .input('projectId', sql.NVarChar(100), p.id)
            .input('title', sql.NVarChar(255), n.title)
            .input('content', sql.NVarChar(sql.MAX), n.content)
            .input('author', sql.NVarChar(150), n.author || 'Especialista TI')
            .query(`
              IF NOT EXISTS (SELECT 1 FROM ti_projects.ProjectNotes WHERE id = @id)
              BEGIN
                INSERT INTO ti_projects.ProjectNotes (id, projectId, title, content, author)
                VALUES (@id, @projectId, @title, @content, @author)
              END
            `);
        }
      }
    }

    console.log(`Sincronizando ${requests.length} solicitudes a ti_projects.Requests...`);
    for (const r of requests) {
      const targetSystemsJson = JSON.stringify(r.targetSystems || []);
      const attachmentsJson = JSON.stringify(r.attachments || []);
      const questionsJson = JSON.stringify(r.aiRecommendedQuestions || []);

      await pool.request()
        .input('id', sql.NVarChar(100), r.id)
        .input('code', sql.NVarChar(50), r.code)
        .input('title', sql.NVarChar(255), r.title)
        .input('description', sql.NVarChar(sql.MAX), r.description || '')
        .input('businessPain', sql.NVarChar(sql.MAX), r.businessPain || '')
        .input('estimatedImpact', sql.NVarChar(sql.MAX), r.estimatedImpact || '')
        .input('urgency', sql.NVarChar(50), r.urgency || 'MEDIUM')
        .input('status', sql.NVarChar(50), r.status || 'SUBMITTED')
        .input('solutionType', sql.NVarChar(50), r.solutionType || 'INTEGRATION_EXISTING')
        .input('targetSystems', sql.NVarChar(sql.MAX), targetSystemsJson)
        .input('attachments', sql.NVarChar(sql.MAX), attachmentsJson)
        .input('requesterName', sql.NVarChar(150), r.requesterName || '')
        .input('requesterEmail', sql.NVarChar(150), r.requesterEmail || '')
        .input('requesterDepartment', sql.NVarChar(150), r.requesterDepartment || '')
        .input('aiCategory', sql.NVarChar(50), r.aiCategory || null)
        .input('aiAnalysis', sql.NVarChar(sql.MAX), r.aiAnalysis || '')
        .input('aiRecommendedQuestions', sql.NVarChar(sql.MAX), questionsJson)
        .input('projectId', sql.NVarChar(100), r.projectId || null)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM ti_projects.Requests WHERE id = @id)
          BEGIN
            INSERT INTO ti_projects.Requests (
              id, code, title, description, businessPain, estimatedImpact, urgency, status,
              solutionType, targetSystems, attachments, requesterName, requesterEmail, requesterDepartment,
              aiCategory, aiAnalysis, aiRecommendedQuestions, projectId
            ) VALUES (
              @id, @code, @title, @description, @businessPain, @estimatedImpact, @urgency, @status,
              @solutionType, @targetSystems, @attachments, @requesterName, @requesterEmail, @requesterDepartment,
              @aiCategory, @aiAnalysis, @aiRecommendedQuestions, @projectId
            )
          END
        `);
    }

    console.log('\n--- VERIFICACIÓN DE REGISTROS INSERTADOS EN SQL SERVER ---');
    const countProjects = await pool.request().query('SELECT COUNT(*) as total FROM ti_projects.Projects');
    const countRequests = await pool.request().query('SELECT COUNT(*) as total FROM ti_projects.Requests');
    const countTasks = await pool.request().query('SELECT COUNT(*) as total FROM ti_projects.Tasks');
    const countNotes = await pool.request().query('SELECT COUNT(*) as total FROM ti_projects.ProjectNotes');

    console.log(`ti_projects.Projects: ${countProjects.recordset[0].total} filas`);
    console.log(`ti_projects.Requests: ${countRequests.recordset[0].total} filas`);
    console.log(`ti_projects.Tasks: ${countTasks.recordset[0].total} filas`);
    console.log(`ti_projects.ProjectNotes: ${countNotes.recordset[0].total} filas`);

    console.log('\n¡TODOS LOS DATOS FUERON SINCRONIZADOS Y PERSISTIDOS EN SQL SERVER EXITOSAMENTE!');
    process.exit(0);
  } catch (err) {
    console.error('Error al sincronizar datos a SQL Server:', err);
    process.exit(1);
  }
}

syncDataToSQL();
