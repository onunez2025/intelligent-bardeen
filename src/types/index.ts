export type Role = 'USER' | 'IT_SPECIALIST' | 'ADMIN';

export type ProjectStatus = 
  | 'BACKLOG'
  | 'DISCOVERY'
  | 'IN_PROGRESS'
  | 'UAT_TESTING'
  | 'DEPLOYED'
  | 'CANCELLED';

export type ProjectCategory = 
  | 'AI_GENAI'
  | 'AUTOMATION_RPA'
  | 'WEB_PORTAL'
  | 'API_INTEGRATION'
  | 'DATA_BI'
  | 'INFRA_SECURITY'
  | 'OTHER';

export type SolutionType = 'NEW_SOLUTION' | 'INTEGRATION_EXISTING';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RequestStatus = 'SUBMITTED' | 'REVIEWING' | 'APPROVED' | 'CONVERTED' | 'REJECTED';

export interface AttachedFile {
  id: string;
  name: string;
  sizeBytes: number;
  type: string;
  url?: string;
  uploadedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  order: number;
  createdAt: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface ProgressLog {
  id: string;
  projectId: string;
  repoNotes: string;
  aiProgressScore: number;
  aiFeedback: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  action: string;
  detail: string;
  performedBy: string;
  timestamp: string;
}

export interface AzureResources {
  webAppName?: string;
  webAppUrl?: string;
  sqlDatabase?: string;
  sqlSchema?: string;
  storageContainer?: string;
  devOpsOrg?: string;
  devOpsProject?: string;
  devOpsRepo?: string;
  pipelineStatus?: 'SUCCEEDED' | 'IN_PROGRESS' | 'FAILED' | 'NOT_CONFIGURED';
  lastCommit?: {
    message: string;
    author: string;
    date: string;
    sha: string;
  };
  healthStatus?: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  lastHealthCheck?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  
  // Naturaleza de la Solución y Sistemas Involucrados
  solutionType: SolutionType;
  targetSystems: string[];
  
  // Archivos Adjuntos e Insumos de Muestra
  attachments?: AttachedFile[];
  
  // Recursos de Azure Cloud & DevOps
  azureResources?: AzureResources;
  
  // Solicitante
  requesterName: string;
  requesterEmail: string;
  requesterDepartment: string;
  
  // Responsable TI
  specialistId: string;
  specialistName: string;
  
  // Cronograma
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  
  // Enlaces TI
  repositoryUrl?: string;
  documentationUrl?: string;
  deploymentUrl?: string;
  
  // Métricas de Impacto & ROI Financiero
  estimatedHours: number;
  actualHours: number;
  hourlyRate: number;
  savedHoursMonth: number;
  savedMoneyMonth: number;
  directCostSavingsYear?: number;
  roiSummary?: string;
  
  // Avance
  manualProgress: number;
  aiEstimatedProgress?: number;
  aiProgressAnalysis?: string;
  lastAiEvaluationAt?: string;
  
  tasks: Task[];
  notes: ProjectNote[];
  progressLogs: ProgressLog[];
  activityLogs?: ActivityLog[];
  requestId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  id: string;
  code: string;
  title: string;
  description: string;
  businessPain: string;
  estimatedImpact: string;
  urgency: UrgencyLevel;
  status: RequestStatus;
  
  // Tipo de solución y Sistemas
  solutionType: SolutionType;
  targetSystems: string[];
  
  // Archivos Adjuntos
  attachments?: AttachedFile[];
  
  requesterName: string;
  requesterEmail: string;
  requesterDepartment: string;
  
  aiCategory?: ProjectCategory;
  aiAnalysis?: string;
  aiRecommendedQuestions?: string[];
  
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyGanttData {
  monthKey: string;
  monthName: string;
  expectedProgress: number;
  actualProgress: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FUTURE' | 'DELAYED';
}

export interface SystemSettings {
  currencySymbol: string;
  currencyCode: string;
  defaultHourlyRate: number;
  azureDevOpsOrg?: string;
  azureDevOpsPat?: string;
}
