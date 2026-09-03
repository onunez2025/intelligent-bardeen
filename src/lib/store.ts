import { Project, UserRequest, MonthlyGanttData, SystemSettings, SolutionType } from '@/types';
import fs from 'fs';
import path from 'path';
import sql from 'mssql';

const sqlConfig: sql.config = {
  user: 'soledbserveradmin',
  password: '@s0le@dm1nAI#82,',
  server: 'soledbserver.database.windows.net',
  database: 'soledb-puntoventa',
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  connectionTimeout: 5000,
  requestTimeout: 10000
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;
async function getSqlPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = sql.connect(sqlConfig).catch((err: Error) => {
      console.warn('Advertencia: Conexión directa a SQL Server falló, usando persistencia local:', err.message);
      poolPromise = null;
      throw err;
    });
  }
  return poolPromise;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const REQUESTS_FILE = path.join(DATA_DIR, 'requests.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const defaultSettings: SystemSettings = {
  currencySymbol: '$',
  currencyCode: 'USD',
  defaultHourlyRate: 18
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export class ProjectStore {
  static getSettings(): SystemSettings {
    try {
      ensureDataDir();
      if (!fs.existsSync(SETTINGS_FILE)) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
      }
      const content = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return defaultSettings;
    }
  }

  static saveSettings(settings: SystemSettings) {
    try {
      ensureDataDir();
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error guardando settings:', e);
    }
  }

  static getProjects(): Project[] {
    try {
      ensureDataDir();
      const content = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }

  static saveProjects(projects: Project[]) {
    try {
      ensureDataDir();
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error guardando proyectos:', e);
    }
  }

  static getProjectById(id: string): Project | undefined {
    const projects = this.getProjects();
    return projects.find(p => p.id === id || p.code.toLowerCase() === id.toLowerCase());
  }

  static createProject(data: Partial<Project>): Project {
    const projects = this.getProjects();
    const settings = this.getSettings();
    const count = projects.length + 1;
    const year = new Date().getFullYear();
    const code = data.code || `PROJ-${year}-${String(count).padStart(3, '0')}`;

    const hourlyRate = Number(data.hourlyRate) || settings.defaultHourlyRate || 18;
    const savedHoursMonth = Number(data.savedHoursMonth) || 0;
    const savedMoneyMonth = data.savedMoneyMonth !== undefined ? Number(data.savedMoneyMonth) : (savedHoursMonth * hourlyRate);

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      code,
      name: data.name || 'Nuevo Proyecto de TI',
      description: data.description || '',
      category: data.category || 'OTHER',
      status: data.status || 'BACKLOG',
      solutionType: data.solutionType || 'INTEGRATION_EXISTING',
      targetSystems: data.targetSystems || [],
      attachments: data.attachments || [],
      requesterName: data.requesterName || 'Usuario Solicitante',
      requesterEmail: data.requesterEmail || 'usuario@empresa.com',
      requesterDepartment: data.requesterDepartment || 'Área General',
      specialistId: data.specialistId || 'user-onunez',
      specialistName: data.specialistName || 'Orlando Núñez',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      targetEndDate: data.targetEndDate || new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0],
      repositoryUrl: data.repositoryUrl || '',
      documentationUrl: data.documentationUrl || '',
      deploymentUrl: data.deploymentUrl || '',
      estimatedHours: Number(data.estimatedHours) || 80,
      actualHours: Number(data.actualHours) || 0,
      hourlyRate,
      savedHoursMonth,
      savedMoneyMonth,
      directCostSavingsYear: Number(data.directCostSavingsYear) || 0,
      roiSummary: data.roiSummary || `Ahorro estimado de ${settings.currencySymbol}${savedMoneyMonth}/mes (${savedHoursMonth} hrs/mes).`,
      manualProgress: Number(data.manualProgress) || 0,
      aiEstimatedProgress: Number(data.aiEstimatedProgress) || 0,
      aiProgressAnalysis: data.aiProgressAnalysis || '',
      lastAiEvaluationAt: undefined,
      tasks: data.tasks || [],
      notes: data.notes || [],
      progressLogs: data.progressLogs || [],
      requestId: data.requestId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.unshift(newProject);
    this.saveProjects(projects);

    // Sincronizar en segundo plano a Azure SQL Server
    this.syncProjectToSqlServer(newProject).catch((e: Error) => console.warn('SQL async sync:', e.message));

    return newProject;
  }

  static updateProject(id: string, updates: Partial<Project>): Project | null {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    const current = projects[index];
    const hourlyRate = updates.hourlyRate !== undefined ? Number(updates.hourlyRate) : (current.hourlyRate || 18);
    const savedHoursMonth = updates.savedHoursMonth !== undefined ? Number(updates.savedHoursMonth) : (current.savedHoursMonth || 0);
    
    let savedMoneyMonth = updates.savedMoneyMonth !== undefined 
      ? Number(updates.savedMoneyMonth) 
      : (savedHoursMonth * hourlyRate);

    projects[index] = {
      ...current,
      ...updates,
      hourlyRate,
      savedHoursMonth,
      savedMoneyMonth,
      updatedAt: new Date().toISOString()
    };

    this.saveProjects(projects);

    // Sincronizar en segundo plano a Azure SQL Server
    this.syncProjectToSqlServer(projects[index]).catch((e: Error) => console.warn('SQL async sync:', e.message));

    return projects[index];
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;
    this.saveProjects(filtered);

    // Eliminar en SQL Server
    getSqlPool().then(pool => {
      pool.request()
        .input('id', sql.NVarChar(100), id)
        .query('DELETE FROM ti_projects.Projects WHERE id = @id');
    }).catch((e: Error) => console.warn('SQL delete sync error:', e.message));

    return true;
  }

  // Solicitudes (Intake)
  static getRequests(): UserRequest[] {
    try {
      ensureDataDir();
      const content = fs.readFileSync(REQUESTS_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }

  static saveRequests(requests: UserRequest[]) {
    try {
      ensureDataDir();
      fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error guardando solicitudes:', e);
    }
  }

  static createRequest(data: Partial<UserRequest>): UserRequest {
    const requests = this.getRequests();
    const count = requests.length + 1;
    const year = new Date().getFullYear();
    const code = `SOL-${year}-${String(count).padStart(3, '0')}`;

    const newRequest: UserRequest = {
      id: `req-${Date.now()}`,
      code,
      title: data.title || 'Nueva Solicitud',
      description: data.description || '',
      businessPain: data.businessPain || '',
      estimatedImpact: data.estimatedImpact || '',
      urgency: data.urgency || 'MEDIUM',
      status: 'SUBMITTED',
      solutionType: data.solutionType || 'INTEGRATION_EXISTING',
      targetSystems: data.targetSystems || [],
      attachments: data.attachments || [],
      requesterName: data.requesterName || 'Usuario Corporativo',
      requesterEmail: data.requesterEmail || 'usuario@empresa.com',
      requesterDepartment: data.requesterDepartment || 'Área General',
      aiCategory: data.aiCategory,
      aiAnalysis: data.aiAnalysis,
      aiRecommendedQuestions: data.aiRecommendedQuestions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    this.saveRequests(requests);

    // Sincronizar a SQL Server
    this.syncRequestToSqlServer(newRequest).catch((e: Error) => console.warn('SQL request sync:', e.message));

    return newRequest;
  }

  static updateRequest(id: string, updates: Partial<UserRequest>): UserRequest | null {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return null;

    requests[index] = {
      ...requests[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveRequests(requests);

    // Sincronizar a SQL Server
    this.syncRequestToSqlServer(requests[index]).catch((e: Error) => console.warn('SQL request sync:', e.message));

    return requests[index];
  }

  static convertRequestToProject(requestId: string, projectOptions?: Partial<Project>): Project | null {
    const requests = this.getRequests();
    const req = requests.find(r => r.id === requestId);
    if (!req) return null;

    const systemsNote = req.targetSystems && req.targetSystems.length > 0
      ? `Sistemas Involucrados: ${req.targetSystems.join(', ')}`
      : 'Solución Nueva / Sin dependencias de plataformas anteriores';

    const newProject = this.createProject({
      name: req.title,
      description: req.description,
      category: req.aiCategory || (req.solutionType === 'INTEGRATION_EXISTING' ? 'API_INTEGRATION' : 'OTHER'),
      status: 'DISCOVERY',
      solutionType: req.solutionType,
      targetSystems: req.targetSystems || [],
      attachments: req.attachments || [],
      requesterName: req.requesterName,
      requesterEmail: req.requesterEmail,
      requesterDepartment: req.requesterDepartment,
      roiSummary: req.estimatedImpact,
      requestId: req.id,
      notes: [
        {
          id: `note-init-${Date.now()}`,
          projectId: '',
          title: 'Requerimiento Original de Intake',
          content: `Dolor reportado: ${req.businessPain}\n\n${systemsNote}\n\nImpacto esperado: ${req.estimatedImpact}\n\nAnálisis de IA:\n${req.aiAnalysis || 'Pendiente de profundizar'}`,
          author: 'Sistema Intake / ' + req.requesterName,
          createdAt: new Date().toISOString()
        }
      ],
      tasks: [
        { id: `t-init-1`, projectId: '', title: 'Reunión de Discovery y Validación de Alcance con ' + req.requesterName, isCompleted: false, order: 1, createdAt: new Date().toISOString() },
        { id: `t-init-2`, projectId: '', title: `Verificación de accesos / credenciales para ${req.targetSystems?.join(', ') || 'el repositorio'}`, isCompleted: false, order: 2, createdAt: new Date().toISOString() },
        { id: `t-init-3`, projectId: '', title: 'Diseño del Modelo de Datos y Arquitectura de Integración', isCompleted: false, order: 3, createdAt: new Date().toISOString() },
        { id: `t-init-4`, projectId: '', title: 'Desarrollo del Prototipo / MVP', isCompleted: false, order: 4, createdAt: new Date().toISOString() },
        { id: `t-init-5`, projectId: '', title: 'Pruebas UAT con el usuario y Pase a Producción', isCompleted: false, order: 5, createdAt: new Date().toISOString() }
      ],
      ...projectOptions
    });

    this.updateRequest(requestId, {
      status: 'CONVERTED',
      projectId: newProject.id
    });

    return newProject;
  }

  // Métodos de sincronización directa a SQL Server
  private static async syncProjectToSqlServer(p: Project) {
    try {
      const pool = await getSqlPool();
      await pool.request()
        .input('id', sql.NVarChar(100), p.id)
        .input('code', sql.NVarChar(50), p.code)
        .input('name', sql.NVarChar(255), p.name)
        .input('description', sql.NVarChar(sql.MAX), p.description || '')
        .input('category', sql.NVarChar(50), p.category || 'OTHER')
        .input('status', sql.NVarChar(50), p.status || 'BACKLOG')
        .input('solutionType', sql.NVarChar(50), p.solutionType || 'INTEGRATION_EXISTING')
        .input('targetSystems', sql.NVarChar(sql.MAX), JSON.stringify(p.targetSystems || []))
        .input('attachments', sql.NVarChar(sql.MAX), JSON.stringify(p.attachments || []))
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
    } catch (e: any) {
      console.warn('Error en syncProjectToSqlServer:', e.message);
    }
  }

  private static async syncRequestToSqlServer(r: UserRequest) {
    try {
      const pool = await getSqlPool();
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
        .input('targetSystems', sql.NVarChar(sql.MAX), JSON.stringify(r.targetSystems || []))
        .input('attachments', sql.NVarChar(sql.MAX), JSON.stringify(r.attachments || []))
        .input('requesterName', sql.NVarChar(150), r.requesterName || '')
        .input('requesterEmail', sql.NVarChar(150), r.requesterEmail || '')
        .input('requesterDepartment', sql.NVarChar(150), r.requesterDepartment || '')
        .input('aiCategory', sql.NVarChar(50), r.aiCategory || null)
        .input('aiAnalysis', sql.NVarChar(sql.MAX), r.aiAnalysis || '')
        .input('aiRecommendedQuestions', sql.NVarChar(sql.MAX), JSON.stringify(r.aiRecommendedQuestions || []))
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
          ELSE
          BEGIN
            UPDATE ti_projects.Requests SET
              status = @status, projectId = @projectId, updatedAt = GETDATE()
            WHERE id = @id
          END
        `);
    } catch (e: any) {
      console.warn('Error en syncRequestToSqlServer:', e.message);
    }
  }

  static calculateMonthlyGanttForProject(project: Project): {
    months: MonthlyGanttData[];
    currentMonthExpected: number;
    currentActual: number;
    difference: number;
    healthStatus: 'A_TIEMPO' | 'ADELANTADO' | 'EN_RIESGO' | 'RETRASADO';
  } {
    const startDate = new Date(project.startDate);
    const targetEndDate = new Date(project.targetEndDate);
    const now = new Date();

    const actualProgress = project.aiEstimatedProgress ?? project.manualProgress;

    const months: MonthlyGanttData[] = [];
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(targetEndDate.getFullYear(), targetEndDate.getMonth() + 1, 0);

    const totalDays = Math.max(1, (targetEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    while (current <= endMonth) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const monthName = `${monthNames[current.getMonth()]} ${current.getFullYear()}`;

      let expectedProgress = 0;
      if (monthEnd <= startDate) {
        expectedProgress = 0;
      } else if (monthEnd >= targetEndDate) {
        expectedProgress = 100;
      } else {
        const daysElapsed = (monthEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        expectedProgress = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));
      }

      let status: MonthlyGanttData['status'] = 'FUTURE';
      if (monthEnd < now) {
        status = 'COMPLETED';
      } else if (current <= now && monthEnd >= now) {
        status = 'IN_PROGRESS';
      }

      months.push({
        monthKey,
        monthName,
        expectedProgress,
        actualProgress: status === 'COMPLETED' ? Math.min(expectedProgress, actualProgress) : (status === 'IN_PROGRESS' ? actualProgress : 0),
        status
      });

      current.setMonth(current.getMonth() + 1);
    }

    let currentMonthExpected = 0;
    if (now <= startDate) currentMonthExpected = 0;
    else if (now >= targetEndDate) currentMonthExpected = 100;
    else {
      const daysSoFar = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      currentMonthExpected = Math.min(100, Math.max(0, Math.round((daysSoFar / totalDays) * 100)));
    }

    const difference = actualProgress - currentMonthExpected;
    let healthStatus: 'A_TIEMPO' | 'ADELANTADO' | 'EN_RIESGO' | 'RETRASADO' = 'A_TIEMPO';

    if (project.status === 'DEPLOYED' || actualProgress === 100) {
      healthStatus = 'A_TIEMPO';
    } else if (difference >= 10) {
      healthStatus = 'ADELANTADO';
    } else if (difference >= -5) {
      healthStatus = 'A_TIEMPO';
    } else if (difference >= -20) {
      healthStatus = 'EN_RIESGO';
    } else {
      healthStatus = 'RETRASADO';
    }

    return {
      months,
      currentMonthExpected,
      currentActual: actualProgress,
      difference,
      healthStatus
    };
  }

  static getExecutiveKPIs() {
    const projects = this.getProjects();
    const requests = this.getRequests();
    const settings = this.getSettings();

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status !== 'DEPLOYED' && p.status !== 'CANCELLED').length;
    const deployedProjects = projects.filter(p => p.status === 'DEPLOYED').length;
    const pendingRequests = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'REVIEWING').length;

    const totalSavedHoursMonth = projects.reduce((acc, p) => acc + (p.savedHoursMonth || 0), 0);
    const totalSavedMoneyMonth = projects.reduce((acc, p) => acc + (p.savedMoneyMonth || ((p.savedHoursMonth || 0) * (p.hourlyRate || 18))), 0);
    const totalDirectSavingsYear = projects.reduce((acc, p) => acc + (p.directCostSavingsYear || 0), 0);
    const totalAnnualEconomicImpact = (totalSavedMoneyMonth * 12) + totalDirectSavingsYear;

    const totalEstimatedHours = projects.reduce((acc, p) => acc + (p.estimatedHours || 0), 0);
    const totalActualHours = projects.reduce((acc, p) => acc + (p.actualHours || 0), 0);

    const byCategory: Record<string, number> = {
      AI_GENAI: 0,
      AUTOMATION_RPA: 0,
      WEB_PORTAL: 0,
      DATA_BI: 0,
      API_INTEGRATION: 0,
      OTHER: 0
    };

    projects.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    });

    let onTrackCount = 0;
    let atRiskCount = 0;
    let delayedCount = 0;

    projects.filter(p => p.status !== 'DEPLOYED' && p.status !== 'CANCELLED').forEach(p => {
      const gantt = this.calculateMonthlyGanttForProject(p);
      if (gantt.healthStatus === 'A_TIEMPO' || gantt.healthStatus === 'ADELANTADO') onTrackCount++;
      else if (gantt.healthStatus === 'EN_RIESGO') atRiskCount++;
      else delayedCount++;
    });

    return {
      settings,
      totalProjects,
      activeProjects,
      deployedProjects,
      pendingRequests,
      totalSavedHoursMonth,
      totalSavedMoneyMonth,
      totalDirectSavingsYear,
      totalAnnualEconomicImpact,
      totalEstimatedHours,
      totalActualHours,
      byCategory,
      healthOverview: {
        onTrackCount,
        atRiskCount,
        delayedCount,
        onTrackPercentage: activeProjects > 0 ? Math.round((onTrackCount / activeProjects) * 100) : 100
      }
    };
  }
}
