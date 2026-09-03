'use client';

import React, { useState } from 'react';
import { Project, ProjectCategory } from '@/types';
import { 
  CalendarRange, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Cpu,
  Workflow,
  Globe,
  BarChart3,
  TrendingUp,
  FolderGit2,
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';

interface GanttChartProps {
  projects: Array<Project & { gantt?: any }>;
  onSelectProject: (project: Project) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({ projects, onSelectProject }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterHealth, setFilterHealth] = useState<string>('ALL');

  const months = [
    { key: '2026-01', label: 'Ene' },
    { key: '2026-02', label: 'Feb' },
    { key: '2026-03', label: 'Mar' },
    { key: '2026-04', label: 'Abr' },
    { key: '2026-05', label: 'May' },
    { key: '2026-06', label: 'Jun' },
    { key: '2026-07', label: 'Jul' },
    { key: '2026-08', label: 'Ago', current: true },
    { key: '2026-09', label: 'Sep' },
    { key: '2026-10', label: 'Oct' },
    { key: '2026-11', label: 'Nov' },
    { key: '2026-12', label: 'Dic' }
  ];

  const filteredProjects = projects.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const health = p.gantt?.healthStatus || 'A_TIEMPO';
    const matchesHealth = filterHealth === 'ALL' || health === filterHealth;
    return matchesCat && matchesHealth;
  });

  const onTrackCount = projects.filter(p => p.gantt?.healthStatus === 'A_TIEMPO' || p.gantt?.healthStatus === 'ADELANTADO').length;
  const atRiskCount = projects.filter(p => p.gantt?.healthStatus === 'EN_RIESGO').length;
  const delayedCount = projects.filter(p => p.gantt?.healthStatus === 'RETRASADO').length;

  const getMonthIndex = (dateStr?: string) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    return date.getMonth();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DEPLOYED': return '#00c875';
      case 'IN_PROGRESS': return '#fdab3d';
      case 'UAT_TESTING': return '#a25ddc';
      case 'DISCOVERY': return '#579bfc';
      default: return '#94a3b8';
    }
  };

  const getHealthBadge = (healthStatus: string, diff: number) => {
    switch (healthStatus) {
      case 'ADELANTADO':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-[#00854d] bg-[#00c875]/15 px-2 py-0.5 rounded-full">
            +{diff}% Adelanto
          </span>
        );
      case 'A_TIEMPO':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-[#0073ea] bg-[#0073ea]/10 px-2 py-0.5 rounded-full">
            A Tiempo
          </span>
        );
      case 'EN_RIESGO':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-[#b26b00] bg-[#fdab3d]/20 px-2 py-0.5 rounded-full">
            {diff}% En Riesgo
          </span>
        );
      case 'RETRASADO':
        return (
          <span className="inline-flex items-center text-[10px] font-bold text-[#df2f4a] bg-[#e2445c]/15 px-2 py-0.5 rounded-full">
            {diff}% Retraso
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Banner Superior Limpio con Filtros */}
      <div className="bg-white rounded-2xl border border-[#d0d7e5] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">Cronograma Mensual & Diagrama de Gantt</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Año 2026
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparativo de avance real vs. meta esperada mes a mes según fecha de inicio y fin
          </p>
        </div>

        {/* Resumen de Salud */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <button
            onClick={() => setFilterHealth(filterHealth === 'A_TIEMPO' ? 'ALL' : 'A_TIEMPO')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filterHealth === 'A_TIEMPO' ? 'bg-[#00c875] text-white border-[#00c875]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            A Tiempo ({onTrackCount})
          </button>
          <button
            onClick={() => setFilterHealth(filterHealth === 'EN_RIESGO' ? 'ALL' : 'EN_RIESGO')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filterHealth === 'EN_RIESGO' ? 'bg-[#fdab3d] text-white border-[#fdab3d]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            En Riesgo ({atRiskCount})
          </button>
          <button
            onClick={() => setFilterHealth(filterHealth === 'RETRASADO' ? 'ALL' : 'RETRASADO')}
            className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              filterHealth === 'RETRASADO' ? 'bg-[#e2445c] text-white border-[#e2445c]' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Con Retraso ({delayedCount})
          </button>
        </div>
      </div>

      {/* Contenedor del Gantt */}
      <div className="bg-white rounded-2xl border border-[#d0d7e5] shadow-2xs overflow-hidden">
        
        {/* Cabecera de la Línea de Tiempo */}
        <div className="grid grid-cols-12 border-b border-[#e6ebf5] bg-[#fafbfd] text-[11px] font-bold text-slate-500 py-3 px-4">
          <div className="col-span-5 md:col-span-4 flex items-center space-x-2">
            <span>PROYECTO & DETALLE</span>
          </div>
          <div className="col-span-7 md:col-span-8 grid grid-cols-12 text-center">
            {months.map((m) => (
              <div
                key={m.key}
                className={`py-0.5 rounded text-[11px] font-bold transition-all ${
                  m.current
                    ? 'text-[#0073ea] bg-[#0073ea]/10 shadow-2xs'
                    : 'text-slate-500'
                }`}
              >
                <span>{m.label}</span>
                {m.current && <span className="block text-[8px] uppercase tracking-tighter text-[#0073ea]">Hoy</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Filas de Proyectos */}
        <div className="divide-y divide-[#f0f3f8]">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No hay proyectos que coincidan con los filtros seleccionados.
            </div>
          ) : (
            filteredProjects.map((project) => {
              const startIdx = Math.max(0, getMonthIndex(project.startDate));
              const endIdx = Math.min(11, getMonthIndex(project.targetEndDate));
              const spanMonths = Math.max(1, endIdx - startIdx + 1);
              
              const actualProgress = project.aiEstimatedProgress ?? project.manualProgress;
              const gantt = project.gantt || {};
              const expected = gantt.currentMonthExpected || 0;
              const diff = gantt.difference || (actualProgress - expected);

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="grid grid-cols-12 py-3 px-4 hover:bg-[#f8faff] transition-colors cursor-pointer items-center group"
                >
                  {/* Columna Información del Proyecto */}
                  <div className="col-span-5 md:col-span-4 pr-3 border-r border-[#f0f3f8]">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {project.code}
                      </span>
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#0073ea] transition-colors truncate">
                        {project.name}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      {getHealthBadge(gantt.healthStatus || 'A_TIEMPO', diff)}
                      <span className="text-[10px] text-slate-400">
                        Avance: <strong className="text-slate-700">{actualProgress}%</strong> (Meta: {expected}%)
                      </span>
                    </div>
                  </div>

                  {/* Columna Gráfica de Línea de Tiempo (Gantt Grid) */}
                  <div className="col-span-7 md:col-span-8 grid grid-cols-12 h-10 items-center relative px-1">
                    
                    {/* Líneas guía verticales */}
                    <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                      {months.map(m => (
                        <div key={m.key} className={`border-r border-[#f0f3f8] h-full ${m.current ? 'bg-[#0073ea]/5' : ''}`} />
                      ))}
                    </div>

                    {/* Barra de Proyecto en el Gantt */}
                    <div
                      className="relative h-6 rounded-lg overflow-hidden shadow-2xs border border-slate-200 bg-slate-100 transition-all z-10"
                      style={{
                        gridColumnStart: startIdx + 1,
                        gridColumnEnd: `span ${spanMonths}`,
                      }}
                    >
                      {/* Progreso Real (Llenado) */}
                      <div
                        className="absolute left-0 top-0 bottom-0 transition-all rounded-l-lg"
                        style={{
                          width: `${actualProgress}%`,
                          backgroundColor: getStatusColor(project.status)
                        }}
                      />

                      {/* Texto interno de la barra */}
                      <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-bold text-slate-800 drop-shadow-2xs">
                        <span className="truncate">{project.startDate.split('-').slice(1).join('/')}</span>
                        <span>{actualProgress}%</span>
                        <span className="truncate">{project.targetEndDate.split('-').slice(1).join('/')}</span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};
