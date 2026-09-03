'use client';

import React, { useState, useRef } from 'react';
import { Project, ProjectStatus, ProjectCategory, SolutionType, AttachedFile } from '@/types';
import { exportSingleProjectToExcel } from '@/lib/excel_export';
import { 
  X, 
  FolderGit2, 
  ExternalLink, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Save, 
  BookOpen, 
  Globe, 
  Trash2,
  Edit3,
  Calendar,
  Clock,
  TrendingUp,
  User,
  Building,
  Check,
  Paperclip,
  Upload,
  FileSpreadsheet,
  FileText,
  FileImage,
  File,
  Download,
  History,
  Activity,
  Zap,
  FileCode2
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onRunAiEvaluation: (id: string, repoNotes: string) => Promise<any>;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onUpdateProject,
  onRunAiEvaluation
}) => {
  if (!project) return null;

  const [activeTab, setActiveTab] = useState<'EDIT_FORM' | 'ATTACHMENTS' | 'TASKS' | 'AI_AUDIT' | 'NOTES' | 'HISTORY'>('EDIT_FORM');
  const [formData, setFormData] = useState<Partial<Project>>({ ...project });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Archivos
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronización Automática Multi-Archivo con docs/superpowers (plans & specs)
  interface SuperpowerDoc {
    id: string;
    name: string;
    folder: 'plans' | 'specs';
    content: string;
  }

  const [showSuperpowersModal, setShowSuperpowersModal] = useState(false);
  const [activeFolderTab, setActiveFolderTab] = useState<'plans' | 'specs'>('plans');
  const [superpowersFiles, setSuperpowersFiles] = useState<SuperpowerDoc[]>([
    {
      id: 'doc-plan-1',
      name: '01_arquitectura_y_db.md',
      folder: 'plans',
      content: `## Plan Fase 1: Arquitectura y Base de Datos (docs/superpowers/plans/01_arquitectura_y_db.md)

### Tareas y Hitos
- [x] Configurar proyecto Next.js y variables de entorno
- [x] Conexión y creación de tablas en Azure SQL Server (esquema ti_projects)
- [x] Integración de API Key oficial de DeepSeek
- [ ] Implementar receptor de Webhooks para Azure DevOps`
    },
    {
      id: 'doc-plan-2',
      name: '02_ui_y_flujos.md',
      folder: 'plans',
      content: `## Plan Fase 2: Vistas y Experiencia de Usuario (docs/superpowers/plans/02_ui_y_flujos.md)

### Entregables Frontend
- [x] Rediseño de tabla principal estilo Monday con paleta 60-30-10
- [x] Implementación de Diagrama de Gantt mensual con cálculo de avance
- [x] Formulario formal de requerimientos en /solicitud
- [ ] Realizar pruebas de aceptación UAT con usuarios de Finanzas`
    },
    {
      id: 'doc-spec-1',
      name: 'especificacion_funcional.md',
      folder: 'specs',
      content: `## Especificación Técnica de Sistemas (docs/superpowers/specs/especificacion_funcional.md)

### Integraciones y Seguridad
- [x] Autenticación corporativa institucional Microsoft 365
- [x] Catálogo de infraestructura Azure Web App y Azure Repos
- [ ] Automatizar exportación de reportes consolidados a Excel
- [ ] Despliegue en Azure Linux App Service`
    }
  ]);

  const [isSyncingSuperpowers, setIsSyncingSuperpowers] = useState(false);
  const [superpowersSyncMessage, setSuperpowersSyncMessage] = useState<string | null>(null);
  const mdFileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadMdFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newDocs: SuperpowerDoc[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const text = await file.text();
      newDocs.push({
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        folder: activeFolderTab,
        content: text
      });
    }

    setSuperpowersFiles(prev => [...prev, ...newDocs]);
    if (mdFileInputRef.current) mdFileInputRef.current.value = '';
  };

  const removeSuperpowerDoc = (id: string) => {
    setSuperpowersFiles(prev => prev.filter(d => d.id !== id));
  };

  const handleSyncSuperpowers = async () => {
    if (superpowersFiles.length === 0) return;
    setIsSyncingSuperpowers(true);
    setSuperpowersSyncMessage(null);
    try {
      const payloadFiles = superpowersFiles.map(d => ({
        fileName: `docs/superpowers/${d.folder}/${d.name}`,
        content: d.content
      }));

      const res = await fetch(`/api/projects/${project.id}/sync-superpowers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: payloadFiles
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuperpowersSyncMessage(`¡Sincronización Exitosa! DeepSeek analizó ${data.data.processedFiles?.length || superpowersFiles.length} archivos md y consolidó ${data.data.totalTasks} tareas (${data.data.completedTasksCount} completadas). Avance global: ${data.data.calculatedProgress}%`);
        await onUpdateProject(project.id, {
          tasks: data.data.tasks,
          manualProgress: data.data.calculatedProgress,
          aiEstimatedProgress: data.data.calculatedProgress
        });
        setTimeout(() => {
          setShowSuperpowersModal(false);
          setSuperpowersSyncMessage(null);
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncingSuperpowers(false);
    }
  };

  const enterpriseSystems = [
    { id: 'SAP', label: 'SAP' },
    { id: 'C4C', label: 'SAP C4C' },
    { id: 'FSM', label: 'SAP FSM' },
    { id: 'Sig Web', label: 'SIG Web' },
    { id: 'Beetrack', label: 'Beetrack' },
    { id: 'Punto de Venta', label: 'Punto de Venta' },
    { id: 'Siatc', label: 'SIATC' },
    { id: 'Microsoft 365', label: 'Microsoft 365' },
  ];

  const toggleFormSystem = (sysId: string) => {
    const current = formData.targetSystems || [];
    if (current.includes(sysId)) {
      setFormData({ ...formData, targetSystems: current.filter(s => s !== sysId) });
    } else {
      setFormData({ ...formData, targetSystems: [...current, sysId] });
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newFiles: AttachedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadForm = new FormData();
        uploadForm.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: uploadForm
        });

        if (res.ok) {
          const data = await res.json();
          if (data.file) newFiles.push(data.file);
        }
      }

      const updatedAttachments = [...(formData.attachments || []), ...newFiles];
      setFormData(prev => ({ ...prev, attachments: updatedAttachments }));
      await onUpdateProject(project.id, { attachments: updatedAttachments });
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = async (fileId: string) => {
    const updated = (formData.attachments || []).filter(f => f.id !== fileId);
    setFormData(prev => ({ ...prev, attachments: updated }));
    await onUpdateProject(project.id, { attachments: updated });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <FileSpreadsheet className="w-4 h-4 text-[#00c875]" />;
    }
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      return <FileImage className="w-4 h-4 text-[#fdab3d]" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-4 h-4 text-[#e2445c]" />;
    }
    return <File className="w-4 h-4 text-[#0073ea]" />;
  };

  // Tarea nueva
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Nota nueva
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  
  // Agente IA
  const [repoNotesInput, setRepoNotesInput] = useState('');
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false);
  const [aiEvaluationResult, setAiEvaluationResult] = useState<any>(null);

  const handleSaveGeneral = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProject(project.id, formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !currentStatus } : t
    );
    const completedCount = updatedTasks.filter(t => t.isCompleted).length;
    const manualProgress = updatedTasks.length > 0 
      ? Math.round((completedCount / updatedTasks.length) * 100) 
      : project.manualProgress;

    await onUpdateProject(project.id, {
      tasks: updatedTasks,
      manualProgress
    });
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `t-${Date.now()}`,
      projectId: project.id,
      title: newTaskTitle.trim(),
      isCompleted: false,
      order: project.tasks.length + 1,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...project.tasks, newTask];
    await onUpdateProject(project.id, { tasks: updatedTasks });
    setNewTaskTitle('');
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      projectId: project.id,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      author: 'Especialista TI',
      createdAt: new Date().toISOString()
    };

    const updatedNotes = [newNote, ...(project.notes || [])];
    await onUpdateProject(project.id, { notes: updatedNotes });
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  const handleRunAiAudit = async () => {
    setIsEvaluatingAi(true);
    try {
      const result = await onRunAiEvaluation(
        project.id, 
        repoNotesInput || 'Validación de los últimos commits y entregables del repositorio.'
      );
      setAiEvaluationResult(result?.evaluation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluatingAi(false);
    }
  };

  const actualProgress = project.aiEstimatedProgress ?? project.manualProgress;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#d0d7e5] rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#f8f9fc] px-6 py-4 border-b border-[#e6ebf5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold text-[#0073ea] bg-[#0073ea]/10 px-2 py-1 rounded">
              {project.code}
            </span>
            <div>
              <h2 className="text-base font-bold text-[#323338] line-clamp-1">{formData.name}</h2>
              <p className="text-xs text-[#676879]">
                Solicitante: <strong className="text-[#323338]">{formData.requesterName}</strong> • {formData.requesterDepartment}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => exportSingleProjectToExcel(project)}
              type="button"
              className="flex items-center space-x-1.5 bg-[#00c875]/10 hover:bg-[#00c875]/20 text-[#00854d] border border-[#00c875]/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              title="Descargar toda la ficha, tareas y minutas de este proyecto en Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#00c875]" />
              <span>Ficha Excel</span>
            </button>

            <button
              onClick={() => handleSaveGeneral()}
              disabled={isSaving}
              className="flex items-center space-x-1.5 bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#676879] hover:text-[#323338] hover:bg-[#e6ebf5] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación de guardado */}
        {saveSuccess && (
          <div className="bg-[#00c875]/15 border-b border-[#00c875]/30 px-6 py-2 text-xs font-bold text-[#00854d] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Los cambios del proyecto se han guardado exitosamente!</span>
          </div>
        )}

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-[#e6ebf5] bg-white px-6 space-x-4 text-xs font-bold text-[#676879]">
          <button
            onClick={() => setActiveTab('EDIT_FORM')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'EDIT_FORM'
                ? 'text-[#0073ea] border-[#0073ea]'
                : 'border-transparent hover:text-[#323338]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ficha & Edición</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTACHMENTS')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'ATTACHMENTS'
                ? 'text-[#0073ea] border-[#0073ea]'
                : 'border-transparent hover:text-[#323338]'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Archivos & Insumos ({formData.attachments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('TASKS')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'TASKS'
                ? 'text-[#0073ea] border-[#0073ea]'
                : 'border-transparent hover:text-[#323338]'
            }`}
          >
            <span>Tareas ({project.tasks.filter(t => t.isCompleted).length}/{project.tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_AUDIT')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'AI_AUDIT'
                ? 'text-[#784bd1] border-[#a25ddc] font-bold'
                : 'border-transparent hover:text-[#784bd1]'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-[#a25ddc]" />
            <span>Auditor DeepSeek</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTES')}
            className={`py-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'NOTES'
                ? 'text-[#0073ea] border-[#0073ea]'
                : 'border-transparent hover:text-[#323338]'
            }`}
          >
            Minutas ({project.notes?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'HISTORY'
                ? 'text-[#0073ea] border-[#0073ea]'
                : 'border-transparent hover:text-[#323338]'
            }`}
          >
            <History className="w-3.5 h-3.5 text-slate-400" />
            <span>Trazabilidad & Logs</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: FORMULARIO */}
          {activeTab === 'EDIT_FORM' && (
            <form onSubmit={handleSaveGeneral} className="space-y-5">
              
              {/* Bloque 1: Identificación y Sistemas */}
              <div className="bg-[#f8f9fc] border border-[#d0d7e5] rounded-2xl p-4 space-y-3">
                <div className="font-bold text-[#323338] text-xs uppercase tracking-wider">
                  1. Información Principal & Sistemas Corporativos
                </div>

                <div>
                  <label className="block text-[#676879] font-bold mb-1">Nombre del Proyecto</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-semibold text-xs focus:border-[#0073ea] focus:outline-none"
                  />
                </div>

                {/* Selección de Sistemas Corporativos */}
                <div>
                  <label className="block text-[#676879] font-bold mb-1.5">
                    Plataformas / Sistemas Involucrados (SAP, C4C, FSM, Beetrack, POS, etc.)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {enterpriseSystems.map(sys => {
                      const isSel = formData.targetSystems?.includes(sys.id);
                      return (
                        <button
                          key={sys.id}
                          type="button"
                          onClick={() => toggleFormSystem(sys.id)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs border flex items-center space-x-1 transition-colors cursor-pointer ${
                            isSel
                              ? 'bg-[#0073ea] text-white border-[#0073ea]'
                              : 'bg-white text-slate-700 border-[#d0d7e5] hover:border-slate-400'
                          }`}
                        >
                          <span>{sys.label}</span>
                          {isSel && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Estado de Avance</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-bold text-xs"
                    >
                      <option value="BACKLOG">Por Iniciar</option>
                      <option value="DISCOVERY">Discovery / Levantamiento</option>
                      <option value="IN_PROGRESS">En Desarrollo Activo</option>
                      <option value="UAT_TESTING">Pruebas UAT</option>
                      <option value="DEPLOYED">Listo / Producción</option>
                      <option value="CANCELLED">Pausado / Cancelado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Categoría Tecnológica</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-semibold text-xs"
                    >
                      <option value="AI_GENAI">Inteligencia Artificial & LLM</option>
                      <option value="AUTOMATION_RPA">Automatización & RPA</option>
                      <option value="WEB_PORTAL">Portal Web Corporativo</option>
                      <option value="DATA_BI">Analítica de Datos & BI</option>
                      <option value="API_INTEGRATION">Integración de APIs / ERP</option>
                      <option value="OTHER">TI General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">% de Avance Manual</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.manualProgress ?? 0}
                      onChange={e => setFormData({ ...formData, manualProgress: Number(e.target.value) })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 2: Enlaces de TI & Repositorio */}
              <div className="bg-[#f8f9fc] border border-[#d0d7e5] rounded-2xl p-4 space-y-3">
                <div className="font-bold text-[#323338] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <FolderGit2 className="w-4 h-4 text-[#0073ea]" />
                  <span>2. Enlaces de Repositorio de Código & Despliegue</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#676879] font-bold mb-1">URL Repositorio (GitHub/GitLab)</label>
                    <input
                      type="text"
                      value={formData.repositoryUrl || ''}
                      onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">URL Documentación / Wiki</label>
                    <input
                      type="text"
                      value={formData.documentationUrl || ''}
                      onChange={e => setFormData({ ...formData, documentationUrl: e.target.value })}
                      placeholder="https://wiki.empresa.com/..."
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">URL Portal Desplegado</label>
                    <input
                      type="text"
                      value={formData.deploymentUrl || ''}
                      onChange={e => setFormData({ ...formData, deploymentUrl: e.target.value })}
                      placeholder="https://app.empresa.com"
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 3: Fechas del Cronograma (Gantt) */}
              <div className="bg-[#f8f9fc] border border-[#d0d7e5] rounded-2xl p-4 space-y-3">
                <div className="font-bold text-[#323338] text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-[#00c875]" />
                  <span>3. Fechas del Cronograma de Entrega</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Fecha Inicio</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Fecha Fin Prevista (Target)</label>
                    <input
                      type="date"
                      value={formData.targetEndDate || ''}
                      onChange={e => setFormData({ ...formData, targetEndDate: e.target.value })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Bloque 4: Solicitante & ROI */}
              <div className="bg-[#f8f9fc] border border-[#d0d7e5] rounded-2xl p-4 space-y-3">
                <div className="font-bold text-[#323338] text-xs uppercase tracking-wider">
                  4. Solicitante & Métricas de Impacto
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Usuario Solicitante</label>
                    <input
                      type="text"
                      value={formData.requesterName || ''}
                      onChange={e => setFormData({ ...formData, requesterName: e.target.value })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Área Solicitante</label>
                    <input
                      type="text"
                      value={formData.requesterDepartment || ''}
                      onChange={e => setFormData({ ...formData, requesterDepartment: e.target.value })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Ahorro Estimado (Horas/Mes) - ROI</label>
                    <input
                      type="number"
                      value={formData.savedHoursMonth || 0}
                      onChange={e => setFormData({ ...formData, savedHoursMonth: Number(e.target.value) })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#00854d] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#676879] font-bold mb-1">Descripción del Requerimiento / Solución</label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] leading-relaxed focus:border-[#0073ea] focus:outline-none"
                  />
                </div>
              </div>

              {/* Bloque 4: Recursos Azure Cloud & Azure DevOps */}
              <div className="bg-[#f8f9fc] border border-[#d0d7e5] rounded-2xl p-4 space-y-3">
                <div className="font-bold text-[#323338] text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>4. Inventario de Infraestructura Azure & DevOps</span>
                  <span className="text-[10px] font-mono text-[#0073ea] bg-[#0073ea]/10 px-2 py-0.5 rounded">
                    Microsoft Azure
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Azure Web App / URL Producción</label>
                    <input
                      type="url"
                      placeholder="https://app-mi-proyecto.azurewebsites.net"
                      value={formData.deploymentUrl || ''}
                      onChange={e => setFormData({ ...formData, deploymentUrl: e.target.value })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Azure Repos (Repositorio Git)</label>
                    <input
                      type="url"
                      placeholder="https://dev.azure.com/sole/TI/_git/MiRepo"
                      value={formData.repositoryUrl || ''}
                      onChange={e => setFormData({ ...formData, repositoryUrl: e.target.value })}
                      className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Base de Datos Azure SQL</label>
                    <input
                      type="text"
                      disabled
                      value="soledbserver.database.windows.net (ti_projects)"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-600 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#676879] font-bold mb-1">Azure Blob Storage</label>
                    <input
                      type="text"
                      disabled
                      value="stecnico / ti-proyectos-archivos (Preparado)"
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-slate-600 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Botón inferior */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center space-x-1.5 bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando Cambios...' : 'Guardar Todos los Cambios'}</span>
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: ARCHIVOS Y DOCUMENTOS DE MUESTRA */}
          {activeTab === 'ATTACHMENTS' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#323338] text-sm">Archivos de Muestra & Documentación Técnica</h3>
                  <p className="text-slate-500 text-xs">
                    Insumos entregados por el usuario solicitante (Excel, PDFs de prueba, especificaciones o capturas de SAP).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center space-x-1.5 bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Subiendo...' : 'Adjuntar Archivo'}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.docx,.json"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {(!formData.attachments || formData.attachments.length === 0) ? (
                <div className="bg-[#f8f9fc] border border-dashed border-[#d0d7e5] rounded-2xl p-10 text-center text-slate-400">
                  <Paperclip className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-xs">No hay archivos adjuntos en este proyecto.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Haz clic en "Adjuntar Archivo" para subir datasets de prueba o guías técnicas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.attachments.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white p-3.5 rounded-2xl border border-[#d0d7e5] hover:border-[#0073ea] flex items-center justify-between shadow-2xs transition-all group"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <div className="p-2 rounded-xl bg-slate-100 group-hover:bg-[#0073ea]/10 transition-colors">
                          {getFileIcon(file.name)}
                        </div>
                        <div className="truncate">
                          <a
                            href={file.url || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-[#323338] hover:text-[#0073ea] text-xs truncate block"
                          >
                            {file.name}
                          </a>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {formatFileSize(file.sizeBytes)} • {file.uploadedAt.split('T')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <a
                          href={file.url || '#'}
                          download={file.name}
                          className="p-1.5 text-slate-400 hover:text-[#0073ea] rounded-lg hover:bg-slate-100 transition-colors"
                          title="Descargar archivo"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          className="p-1.5 text-slate-400 hover:text-[#e2445c] rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar archivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TAREAS */}
          {activeTab === 'TASKS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-[#323338]">Sub-elementos / Tareas del MVP</h3>
                  <p className="text-slate-500">Marca las tareas para actualizar automáticamente el porcentaje de avance.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSuperpowersModal(true)}
                  className="flex items-center space-x-1.5 bg-[#a25ddc]/10 hover:bg-[#a25ddc]/20 text-[#784bd1] border border-[#a25ddc]/30 font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-[#a25ddc]" />
                  <span>Sincronizar desde docs/superpowers</span>
                </button>
              </div>

              {/* Modal / Diálogo de Sincronización con docs/superpowers */}
              {showSuperpowersModal && (
                <div className="bg-[#a25ddc]/5 border border-[#a25ddc]/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-[#a25ddc] text-white">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#784bd1]">
                          Sincronizar Tareas Automáticamente con DeepSeek AI
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Pega el contenido markdown de tus archivos en <code className="bg-white px-1 rounded border">docs/superpowers/plans</code> o <code className="bg-white px-1 rounded border">specs</code>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSuperpowersModal(false)}
                      className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selector de Carpeta y Carga de Archivos */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs border-b border-slate-200 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-600">Subcarpeta activa:</span>
                      <button
                        type="button"
                        onClick={() => setActiveFolderTab('plans')}
                        className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                          activeFolderTab === 'plans'
                            ? 'bg-[#a25ddc] text-white border-[#a25ddc]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        📁 docs/superpowers/plans ({superpowersFiles.filter(f => f.folder === 'plans').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFolderTab('specs')}
                        className={`px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer ${
                          activeFolderTab === 'specs'
                            ? 'bg-[#a25ddc] text-white border-[#a25ddc]'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        📁 docs/superpowers/specs ({superpowersFiles.filter(f => f.folder === 'specs').length})
                      </button>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={mdFileInputRef}
                        multiple
                        accept=".md,.markdown,.txt"
                        className="hidden"
                        onChange={(e) => handleUploadMdFiles(e.target.files)}
                      />
                      <button
                        type="button"
                        onClick={() => mdFileInputRef.current?.click()}
                        className="flex items-center space-x-1.5 bg-white border border-[#a25ddc]/40 text-[#784bd1] font-bold px-3 py-1 rounded-lg hover:bg-[#a25ddc]/10 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>+ Cargar archivos .md a {activeFolderTab}</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista de Archivos Cargados para Procesar */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                      <span>Lote de archivos a consolidar por DeepSeek ({superpowersFiles.length} documentos):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                      {superpowersFiles.map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs"
                        >
                          <div className="truncate flex items-center space-x-1.5 min-w-0">
                            <FileCode2 className="w-3.5 h-3.5 text-[#a25ddc] shrink-0" />
                            <span className="font-mono text-[11px] text-slate-800 truncate" title={doc.name}>
                              {doc.folder}/{doc.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSuperpowerDoc(doc.id)}
                            className="text-slate-400 hover:text-red-500 p-0.5 ml-1 cursor-pointer"
                            title="Quitar archivo del lote"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vista Previa / Editor del Primer Documento */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Vista previa consolidada para DeepSeek AI:
                    </label>
                    <textarea
                      rows={5}
                      readOnly
                      value={superpowersFiles.map(f => `### [${f.folder}/${f.name}]\n${f.content}`).join('\n\n')}
                      className="w-full bg-slate-50 border border-[#d0d7e5] rounded-xl p-2.5 font-mono text-[10px] text-slate-700 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {superpowersSyncMessage && (
                    <div className="p-2.5 bg-[#00c875]/10 border border-[#00c875]/30 rounded-xl text-xs font-bold text-[#00854d] leading-relaxed">
                      {superpowersSyncMessage}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500">
                      💡 DeepSeek extraerá tareas de todos los archivos y detectará avances completados [x] vs pendientes [ ].
                    </span>

                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowSuperpowersModal(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={isSyncingSuperpowers || superpowersFiles.length === 0}
                        onClick={handleSyncSuperpowers}
                        className="flex items-center space-x-1.5 bg-[#a25ddc] hover:bg-[#8e4bc8] text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isSyncingSuperpowers ? 'DeepSeek Analizando Lote de Archivos...' : `Sincronizar Lote (${superpowersFiles.length} Archivos)`}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddTask} className="flex gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Agregar nuevo entregable o tarea técnica..."
                  className="flex-1 bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl px-3.5 py-2 text-xs text-[#323338] focus:bg-white focus:border-[#0073ea] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center space-x-1 bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </form>

              <div className="space-y-2">
                {project.tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id, task.isCompleted)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      task.isCompleted
                        ? 'bg-[#00c875]/10 border-[#00c875]/30 text-slate-600'
                        : 'bg-[#f8f9fc] border-[#e6ebf5] hover:border-[#0073ea] text-[#323338]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00c875] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className={`font-medium ${task.isCompleted ? 'line-through text-slate-400' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                      {task.isCompleted ? 'Listo' : 'Pendiente'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDITOR DEEPSEEK */}
          {activeTab === 'AI_AUDIT' && (
            <div className="space-y-5">
              <div className="bg-[#a25ddc]/10 border border-[#a25ddc]/30 rounded-2xl p-5">
                <div className="flex items-center space-x-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-[#a25ddc] text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#784bd1] text-sm">
                      Auditor Técnico de Requerimientos vs. Repositorio (DeepSeek)
                    </h3>
                    <p className="text-xs text-slate-600">
                      Compara el requerimiento original contra los commits y tareas entregadas para diagnosticar la salud del proyecto.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <label className="block text-[#323338] font-bold">
                    Resumen de avances recientes / Commits del repositorio:
                  </label>
                  <textarea
                    rows={3}
                    value={repoNotesInput}
                    onChange={e => setRepoNotesInput(e.target.value)}
                    placeholder="Ej: Se integró el endpoint con SAP y se procesaron los archivos Excel de muestra..."
                    className="w-full bg-white border border-[#d0d7e5] rounded-xl p-3 text-[#323338] focus:border-[#a25ddc] focus:outline-none"
                  />

                  <button
                    onClick={handleRunAiAudit}
                    disabled={isEvaluatingAi}
                    className="flex items-center space-x-2 bg-[#a25ddc] hover:bg-[#8e44ad] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isEvaluatingAi ? 'Analizando con DeepSeek...' : 'Ejecutar Auditoría con DeepSeek'}</span>
                  </button>
                </div>
              </div>

              {(aiEvaluationResult || project.aiProgressAnalysis) && (
                <div className="bg-[#f8f9fc] border border-[#e6ebf5] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#e6ebf5] pb-2">
                    <span className="font-bold text-[#323338] uppercase">Dictamen del Agente Evaluador</span>
                    <span className="font-bold text-[#00854d]">
                      Avance Estimado: {project.aiEstimatedProgress ?? actualProgress}%
                    </span>
                  </div>

                  <p className="text-xs text-[#323338] leading-relaxed whitespace-pre-line">
                    {aiEvaluationResult?.analysis || project.aiProgressAnalysis}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: NOTAS */}
          {activeTab === 'NOTES' && (
            <div className="space-y-4">
              <h3 className="font-bold text-[#323338]">Minutas de Reunión & Notas de Arquitectura</h3>
              
              <form onSubmit={handleAddNote} className="bg-[#f8f9fc] border border-[#e6ebf5] rounded-xl p-3 space-y-2">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  placeholder="Título de la reunión o nota técnica..."
                  className="w-full bg-white border border-[#d0d7e5] rounded-lg px-3 py-1.5 text-xs text-[#323338]"
                />
                <textarea
                  rows={2}
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  placeholder="Detalle de acuerdos o requerimientos especiales..."
                  className="w-full bg-white border border-[#d0d7e5] rounded-lg p-2 text-xs text-[#323338]"
                />
                <button
                  type="submit"
                  className="bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Guardar Minuta
                </button>
              </form>

              <div className="space-y-3">
                {project.notes.map(note => (
                  <div key={note.id} className="bg-white border border-[#e6ebf5] rounded-xl p-4 shadow-xs">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-[#0073ea]">{note.title}</h4>
                      <span className="text-[10px] text-slate-400">{note.createdAt.split('T')[0]}</span>
                    </div>
                    <p className="text-[#323338] whitespace-pre-line leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: HISTORIAL & TRAZABILIDAD (Activity Log) */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              <div className="bg-[#f8f9fc] border border-[#d0d7e5] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#323338] flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-[#0073ea]" />
                    <span>Registro de Trazabilidad & Eventos de Auditoría</span>
                  </h3>
                  <p className="text-xs text-[#676879] mt-0.5">
                    Historial cronológico de cambios de estado, evaluaciones de IA y asignaciones técnicas
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00c875]/15 text-[#00854d]">
                  Audit Trail Activo
                </span>
              </div>

              {/* Timeline de Eventos */}
              <div className="relative pl-6 border-l-2 border-[#0073ea]/30 space-y-6 my-4">
                
                {/* Evento 1: Estado Actual */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#0073ea] border-2 border-white shadow-sm" />
                  <div className="bg-white border border-[#e6ebf5] rounded-xl p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#323338]">Estado Actual del Proyecto: {formData.status}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Última actualización: {project.updatedAt?.split('T')[0]}</span>
                    </div>
                    <p className="text-[11px] text-[#676879] mt-1">
                      Responsable Técnico: <strong className="text-[#323338]">{formData.specialistName || 'Orlando Núñez'}</strong> • Avance actual: <strong className="text-[#00c875]">{formData.aiEstimatedProgress ?? formData.manualProgress}%</strong>
                    </p>
                  </div>
                </div>

                {/* Evento 2: Auditorías DeepSeek */}
                {project.progressLogs && project.progressLogs.length > 0 && (
                  project.progressLogs.map(log => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#a25ddc] border-2 border-white shadow-sm" />
                      <div className="bg-[#a25ddc]/5 border border-[#a25ddc]/20 rounded-xl p-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#784bd1] flex items-center space-x-1">
                            <Bot className="w-3.5 h-3.5" />
                            <span>Auditoría Técnica DeepSeek AI ({log.aiProgressScore}% completitud)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.createdAt?.split('T')[0]}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 mt-1 whitespace-pre-line">
                          {log.aiFeedback}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {/* Evento 3: Inicio de Proyecto */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-[#00c875] border-2 border-white shadow-sm" />
                  <div className="bg-white border border-[#e6ebf5] rounded-xl p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#00854d]">Proyecto Creado / Aprobado desde Intake</span>
                      <span className="text-[10px] text-slate-400 font-mono">{project.createdAt?.split('T')[0]}</span>
                    </div>
                    <p className="text-[11px] text-[#676879] mt-1">
                      Solicitado por: <strong className="text-[#323338]">{project.requesterName}</strong> ({project.requesterDepartment})
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
