'use client';

import React, { useState } from 'react';
import { Project, ProjectStatus, ProjectCategory } from '@/types';
import { 
  ChevronDown, 
  FolderGit2, 
  ExternalLink, 
  Plus, 
  ArrowRight, 
  Edit3, 
  Check, 
  HelpCircle, 
  Info, 
  X, 
  BookOpen,
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';

interface MondayTableProps {
  projects: Array<Project & { gantt?: any }>;
  onSelectProject: (project: Project) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onOpenNewProject: () => void;
  searchQuery: string;
  selectedCategory: string;
}

interface TooltipState {
  title: string;
  explanation: string;
  formula?: string;
  x: number;
  y: number;
  placeAbove: boolean;
}

export const MondayTable: React.FC<MondayTableProps> = ({
  projects,
  onSelectProject,
  onUpdateStatus,
  onOpenNewProject,
  searchQuery,
  selectedCategory
}) => {
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const [showFullGuideModal, setShowFullGuideModal] = useState<boolean>(false);
  const [isCompactView, setIsCompactView] = useState<boolean>(false);

  const filtered = projects.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.requesterDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.targetSystems && p.targetSystems.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesSearch;
  });

  const inProgressProjects = filtered.filter(p => p.status === 'IN_PROGRESS' || p.status === 'UAT_TESTING');
  const discoveryProjects = filtered.filter(p => p.status === 'BACKLOG' || p.status === 'DISCOVERY');
  const completedProjects = filtered.filter(p => p.status === 'DEPLOYED');

  const statusOptions: { value: ProjectStatus; label: string; bg: string; text: string }[] = [
    { value: 'DEPLOYED', label: 'Listo / Producción', bg: '#00c875', text: 'text-white' },
    { value: 'IN_PROGRESS', label: 'Trabajando en ello', bg: '#fdab3d', text: 'text-white' },
    { value: 'UAT_TESTING', label: 'Pruebas UAT', bg: '#a25ddc', text: 'text-white' },
    { value: 'DISCOVERY', label: 'Discovery / Levantamiento', bg: '#579bfc', text: 'text-white' },
    { value: 'BACKLOG', label: 'Por Iniciar', bg: '#94a3b8', text: 'text-white' },
    { value: 'CANCELLED', label: 'Pausado / Cancelado', bg: '#e2445c', text: 'text-white' },
  ];

  const columnTooltips: Record<string, { title: string; explanation: string; formula?: string }> = {
    project: {
      title: 'Proyecto & Sistemas Corporativos',
      explanation: 'Código único, nombre del requerimiento, área solicitante y plataformas integradas (SAP, C4C, Beetrack, POS).'
    },
    owner: {
      title: 'Responsable Técnico',
      explanation: 'Especialista en Transformación Digital e IA a cargo del desarrollo.'
    },
    status: {
      title: 'Estado del Proyecto',
      explanation: 'Fase actual en el ciclo de entrega. Haz clic en la pastilla para cambiarlo en 1 clic.'
    },
    category: {
      title: 'Categoría Tecnológica',
      explanation: 'Tipo de arquitectura: IA & LLM, Automatización RPA, Portales Web, Power BI o APIs.'
    },
    timeline: {
      title: 'Cronograma de Entrega (Gantt)',
      explanation: 'Rango de fechas de inicio y fin planificadas.',
      formula: 'Barra interna = % de Avance Real'
    },
    progress: {
      title: 'Avance Real vs. Meta',
      explanation: 'Compara el avance entregado (verde) contra el tiempo transcurrido en el calendario (gris).',
      formula: 'Meta = (Días Transcurridos / Días Totales) × 100\nDelta = Avance Real - Meta'
    },
    roi: {
      title: 'Retorno de Inversión (ROI en $)',
      explanation: 'Impacto económico mensual estimado al liberar horas de trabajo operativo.',
      formula: 'Ahorro = Horas liberadas/mes × $18/hr + Licencias'
    }
  };

  const handleInfoHover = (e: React.MouseEvent<HTMLButtonElement>, key: string) => {
    const info = columnTooltips[key];
    if (!info) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const placeAbove = rect.top > 220;

    setTooltipState({
      title: info.title,
      explanation: info.explanation,
      formula: info.formula,
      x: rect.left + rect.width / 2,
      y: placeAbove ? rect.top - 8 : rect.bottom + 8,
      placeAbove
    });
  };

  const renderInfoButton = (key: string) => {
    return (
      <button
        type="button"
        onMouseEnter={(e) => handleInfoHover(e, key)}
        onMouseLeave={() => setTooltipState(null)}
        onClick={(e) => {
          e.stopPropagation();
          handleInfoHover(e, key);
        }}
        className="ml-1 text-slate-400 hover:text-[#0073ea] transition-colors p-0.5 cursor-pointer inline-flex items-center"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
    );
  };

  const renderStatusButton = (currentStatus: ProjectStatus, projectId: string) => {
    const current = statusOptions.find(o => o.value === currentStatus) || statusOptions[4];
    const isOpen = openStatusMenuId === projectId;

    return (
      <div className="relative inline-block w-full">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenStatusMenuId(isOpen ? null : projectId);
          }}
          className={`w-full py-1.5 px-2 rounded-lg font-bold text-xs shadow-2xs flex items-center justify-center space-x-1 cursor-pointer transition-all ${current.text}`}
          style={{ backgroundColor: current.bg }}
          title="Haz clic para cambiar el estado"
        >
          <span className="truncate">{current.label}</span>
          <ChevronDown className="w-3 h-3 opacity-80 shrink-0" />
        </button>

        {isOpen && (
          <div 
            className="absolute left-0 top-full mt-1 w-52 bg-white rounded-xl shadow-2xl border border-[#d0d7e5] z-50 p-1.5 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[10px] font-bold text-[#676879] uppercase px-2 py-1 border-b border-[#f0f3f8]">
              Cambiar Estado a:
            </div>
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onUpdateStatus(projectId, opt.value);
                  setOpenStatusMenuId(null);
                }}
                className="w-full py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between text-white transition-transform hover:scale-[1.01] cursor-pointer"
                style={{ backgroundColor: opt.bg }}
              >
                <span>{opt.label}</span>
                {currentStatus === opt.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getCategoryTag = (cat: ProjectCategory) => {
    const labels: Record<string, string> = {
      AI_GENAI: 'IA & LLM',
      AUTOMATION_RPA: 'RPA & Auto',
      WEB_PORTAL: 'Portal Web',
      DATA_BI: 'Power BI',
      API_INTEGRATION: 'Integración API',
      OTHER: 'General'
    };
    return (
      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
        {labels[cat] || cat}
      </span>
    );
  };

  const renderGroup = (
    title: string, 
    groupProjects: Array<Project & { gantt?: any }>, 
    accentColor: string
  ) => {
    const totalMoneySaved = groupProjects.reduce((acc, p) => acc + (p.savedMoneyMonth || ((p.savedHoursMonth || 0) * (p.hourlyRate || 18))), 0);
    const totalHoursSaved = groupProjects.reduce((acc, p) => acc + (p.savedHoursMonth || 0), 0);
    const avgProgress = groupProjects.length > 0 
      ? Math.round(groupProjects.reduce((acc, p) => acc + (p.aiEstimatedProgress ?? p.manualProgress), 0) / groupProjects.length)
      : 0;

    return (
      <div className="mb-6 bg-white rounded-2xl border border-[#d0d7e5] shadow-2xs overflow-hidden">
        
        {/* Header del Grupo */}
        <div className="px-5 py-3 bg-[#ffffff] border-b border-[#e6ebf5] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
            <h2 className="font-bold text-sm tracking-tight text-[#323338]">
              {title}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {groupProjects.length}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
            <span>Impacto: <strong className="text-[#00854d]">${totalMoneySaved.toLocaleString()} / mes</strong> ({totalHoursSaved} hrs)</span>
            <span>Avance: <strong className="text-slate-800">{avgProgress}%</strong></span>
          </div>
        </div>

        {/* Tabla Interactiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="border-b border-[#e6ebf5] bg-[#fafbfd] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-4 w-[340px]">
                  <div className="flex items-center">
                    <span>Proyecto / Sistemas</span>
                    {renderInfoButton('project')}
                  </div>
                </th>
                
                {!isCompactView && (
                  <th className="py-2.5 px-3 w-[120px] text-center">
                    <div className="flex items-center justify-center">
                      <span>Responsable</span>
                      {renderInfoButton('owner')}
                    </div>
                  </th>
                )}

                <th className="py-2.5 px-3 w-[170px] text-center">
                  <div className="flex items-center justify-center">
                    <span>Estado</span>
                    {renderInfoButton('status')}
                  </div>
                </th>

                {!isCompactView && (
                  <th className="py-2.5 px-3 w-[130px] text-center">
                    <div className="flex items-center justify-center">
                      <span>Categoría</span>
                      {renderInfoButton('category')}
                    </div>
                  </th>
                )}

                <th className="py-2.5 px-3 w-[160px] text-center">
                  <div className="flex items-center justify-center">
                    <span>Cronograma</span>
                    {renderInfoButton('timeline')}
                  </div>
                </th>

                <th className="py-2.5 px-3 w-[160px] text-center">
                  <div className="flex items-center justify-center">
                    <span>Avance Real vs Meta</span>
                    {renderInfoButton('progress')}
                  </div>
                </th>

                <th className="py-2.5 px-3 w-[120px] text-center">
                  <div className="flex items-center justify-center">
                    <span>ROI ($)</span>
                    {renderInfoButton('roi')}
                  </div>
                </th>

                <th className="py-2.5 px-3 w-[60px] text-center">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3f8] text-xs">
              {groupProjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                    No hay proyectos registrados en esta sección.
                  </td>
                </tr>
              ) : (
                groupProjects.map((project) => {
                  const actualProgress = project.aiEstimatedProgress ?? project.manualProgress;
                  const gantt = project.gantt || {};
                  const expected = gantt.currentMonthExpected || 0;
                  const diff = gantt.difference || (actualProgress - expected);
                  const moneySaved = project.savedMoneyMonth || (project.savedHoursMonth * (project.hourlyRate || 18));

                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="hover:bg-[#f8faff] transition-colors cursor-pointer group"
                    >
                      {/* Nombre & Código & Sistemas */}
                      <td className="py-3 px-4 border-r border-[#f0f3f8]">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {project.code}
                          </span>
                          <span className="font-semibold text-slate-900 group-hover:text-[#0073ea] transition-colors line-clamp-1">
                            {project.name}
                          </span>
                        </div>

                        {/* Badges de Sistemas Corporativos en Tonos Neutros Elegantes */}
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1 mt-1">
                          {project.targetSystems && project.targetSystems.length > 0 ? (
                            project.targetSystems.map((sys, idx) => (
                              <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 font-mono text-[10px] font-medium border border-slate-200">
                                {sys}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Solución Nueva</span>
                          )}
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-500 truncate">{project.requesterDepartment}</span>
                        </div>
                      </td>

                      {/* Responsable */}
                      {!isCompactView && (
                        <td className="py-2 px-3 border-r border-[#f0f3f8] text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center">
                              ON
                            </div>
                            <span className="text-[11px] text-slate-700 truncate">Orlando N.</span>
                          </div>
                        </td>
                      )}

                      {/* Estado con Color Foco Destacado */}
                      <td className="py-2 px-3 border-r border-[#f0f3f8] text-center">
                        {renderStatusButton(project.status, project.id)}
                      </td>

                      {/* Categoría */}
                      {!isCompactView && (
                        <td className="py-2 px-3 border-r border-[#f0f3f8] text-center">
                          {getCategoryTag(project.category)}
                        </td>
                      )}

                      {/* Cronograma Limpio */}
                      <td className="py-2 px-3 border-r border-[#f0f3f8] text-center">
                        <div className="bg-slate-100 rounded-lg h-5 px-2 flex items-center justify-between text-[10px] font-semibold text-slate-700 relative overflow-hidden border border-slate-200">
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-[#0073ea]/20 transition-all"
                            style={{ width: `${actualProgress}%` }}
                          />
                          <span className="relative z-10">{project.startDate.split('-').slice(1).join('/')}</span>
                          <ArrowRight className="w-2.5 h-2.5 relative z-10 text-slate-400" />
                          <span className="relative z-10">{project.targetEndDate.split('-').slice(1).join('/')}</span>
                        </div>
                      </td>

                      {/* Avance Real vs Meta con Jerarquía */}
                      <td className="py-2 px-3 border-r border-[#f0f3f8] text-center">
                        <div className="flex items-center justify-center space-x-1 font-bold">
                          <span className="text-slate-900 text-xs">{actualProgress}%</span>
                          <span className="text-slate-300 font-normal">/</span>
                          <span className="text-slate-400 font-medium text-[11px]">
                            Meta {expected}%
                          </span>
                        </div>
                        {diff >= 5 && (
                          <span className="text-[10px] font-bold text-[#00854d] block mt-0.5">
                            +{diff}% Adelantado
                          </span>
                        )}
                        {diff <= -10 && (
                          <span className="text-[10px] font-bold text-[#e2445c] block mt-0.5">
                            {diff}% Retraso
                          </span>
                        )}
                      </td>

                      {/* ROI en Dinero en Formato Limpio */}
                      <td className="py-2 px-3 border-r border-[#f0f3f8] text-center">
                        <div className="font-bold text-xs text-slate-900">
                          ${moneySaved.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/ m</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {project.savedHoursMonth} hrs/m
                        </div>
                      </td>

                      {/* Botón Editar */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(project);
                          }}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-[#0073ea] hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Abrir edición completa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Fila Añadir Elemento */}
        <div className="p-2.5 bg-[#fafbfd] border-t border-[#e6ebf5] flex items-center">
          <button
            onClick={onOpenNewProject}
            className="flex items-center space-x-1.5 text-xs text-[#0073ea] hover:text-[#0060c0] font-semibold px-2 py-1 rounded hover:bg-[#0073ea]/10 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Agregar Proyecto en este grupo</span>
          </button>
        </div>

      </div>
    );
  };

  return (
    <div className="p-6 space-y-4" onClick={() => {
      setOpenStatusMenuId(null);
      setTooltipState(null);
    }}>
      
      {/* Barra de Control de Densidad y Guía de Fórmulas */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCompactView(!isCompactView)}
            className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isCompactView 
                ? 'bg-[#0073ea] text-white border-[#0073ea] shadow-xs' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isCompactView ? 'Vista: Compacta (Esencial)' : 'Vista: Extendida (Completa)'}</span>
          </button>
        </div>

        <button
          onClick={() => setShowFullGuideModal(true)}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#0073ea] bg-white border border-slate-200 hover:border-[#0073ea]/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#0073ea]" />
          <span>Guía de Fórmulas & Columnas</span>
        </button>
      </div>

      {renderGroup('Proyectos en Desarrollo Activo & Validación', inProgressProjects, '#0073ea')}
      {renderGroup('Discovery & Nuevos Requerimientos', discoveryProjects, '#a25ddc')}
      {renderGroup('Proyectos Desplegados en Producción', completedProjects, '#00c875')}

      {/* Tooltip Global Flotante */}
      {tooltipState && (
        <div
          className="fixed z-[9999] pointer-events-none w-72 p-3.5 bg-[#181b2a] text-white rounded-2xl shadow-2xl border border-slate-700 font-sans"
          style={{
            left: `${tooltipState.x}px`,
            top: `${tooltipState.y}px`,
            transform: tooltipState.placeAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            maxWidth: 'calc(100vw - 32px)'
          }}
        >
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#579bfc] mb-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-[#0073ea]" />
            <span className="text-white font-bold">{tooltipState.title}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {tooltipState.explanation}
          </p>
          {tooltipState.formula && (
            <div className="mt-2.5 pt-2 border-t border-slate-700 font-mono text-[10px] text-[#00c875] bg-black/40 p-2 rounded-xl whitespace-pre-line leading-normal">
              {tooltipState.formula}
            </div>
          )}
        </div>
      )}

      {/* Modal Guía */}
      {showFullGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-[#d0d7e5] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            
            <div className="bg-[#f8f9fc] px-6 py-4 border-b border-[#e6ebf5] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-[#0073ea]/10 text-[#0073ea]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#323338]">Guía de Columnas, Indicadores & Fórmulas</h2>
                  <p className="text-xs text-[#676879]">Cómo funciona cada dato en el tablero principal de TI</p>
                </div>
              </div>
              <button
                onClick={() => setShowFullGuideModal(false)}
                className="p-1.5 rounded-lg text-[#676879] hover:text-[#323338] hover:bg-[#e6ebf5] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs overflow-y-auto max-h-[70vh]">
              {Object.entries(columnTooltips).map(([k, item]) => (
                <div key={k} className="p-3.5 rounded-2xl bg-[#f8f9fc] border border-[#e6ebf5] space-y-1">
                  <div className="font-bold text-sm text-[#0073ea] flex items-center space-x-1.5">
                    <span>{item.title}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {item.explanation}
                  </p>
                  {item.formula && (
                    <div className="font-mono text-[10px] text-[#00854d] bg-white p-2 rounded-lg border border-[#d0d7e5] mt-1 whitespace-pre-line font-bold">
                      {item.formula}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-[#f8f9fc] px-6 py-3 border-t border-[#e6ebf5] flex justify-end">
              <button
                onClick={() => setShowFullGuideModal(false)}
                className="bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
