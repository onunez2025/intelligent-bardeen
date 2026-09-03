'use client';

import React, { useState } from 'react';
import { Project } from '@/types';
import { 
  FolderKanban, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Cpu, 
  Workflow, 
  Globe, 
  BarChart3, 
  ArrowUpRight,
  FolderGit2,
  Users,
  ShieldCheck,
  DollarSign,
  HelpCircle,
  Info
} from 'lucide-react';

interface ExecutiveDashboardProps {
  kpis: any;
  projects: Array<Project & { gantt?: any }>;
  onSelectProject: (project: Project) => void;
  onNavigateToGantt: () => void;
  onNavigateToIntake: () => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  kpis,
  projects,
  onSelectProject,
  onNavigateToGantt,
  onNavigateToIntake
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const activeProjects = projects.filter(p => p.status !== 'DEPLOYED' && p.status !== 'CANCELLED');
  const onTrackCount = kpis?.healthOverview?.onTrackCount || 0;
  const atRiskCount = kpis?.healthOverview?.atRiskCount || 0;
  const delayedCount = kpis?.healthOverview?.delayedCount || 0;
  const totalActive = Math.max(1, onTrackCount + atRiskCount + delayedCount);
  const currency = kpis?.settings?.currencySymbol || '$';

  const kpiTooltips: Record<string, { title: string; explanation: string; formula?: string }> = {
    money: {
      title: 'Valor Económico Mensual ($)',
      explanation: 'Dinero estimado ahorrado al mes por liberar horas operativas de personal y sustituir licencias de software.',
      formula: 'Valor Mensual = Horas Liberadas/mes × $18/hr + Licencias ahorradas'
    },
    hours: {
      title: 'Horas Hombre Liberadas',
      explanation: 'Suma de horas operativas al mes que el personal de la empresa ya no gasta en procesos manuales repetitivos.',
      formula: 'Suma total de savedHoursMonth de los proyectos activos'
    },
    onTrack: {
      title: 'Cumplimiento del Cronograma',
      explanation: 'Porcentaje de proyectos cuyo avance real es igual o superior a la meta mensual del calendario.',
      formula: '% Cumplimiento = (Proyectos a Tiempo / Proyectos Activos) × 100'
    },
    battery: {
      title: 'Batería de Salud del Portafolio',
      explanation: 'Distribución porcentual en tiempo real de los proyectos activos clasificados en: A Tiempo (Verde), En Riesgo (Ámbar) o Retrasado (Rojo).'
    }
  };

  const renderKpiInfo = (key: string) => {
    const item = kpiTooltips[key];
    if (!item) return null;
    const isTooltipOpen = activeTooltip === key;

    return (
      <div className="relative inline-block ml-1">
        <button
          type="button"
          onMouseEnter={() => setActiveTooltip(key)}
          onMouseLeave={() => setActiveTooltip(null)}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTooltip(isTooltipOpen ? null : key);
          }}
          className="text-slate-400 hover:text-[#0073ea] transition-colors p-0.5 cursor-pointer inline-flex items-center"
          title={item.title}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {isTooltipOpen && (
          <div 
            className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#1f2336] text-white rounded-xl shadow-2xl z-50 text-left border border-slate-700 pointer-events-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#579bfc] mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>{item.title}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {item.explanation}
            </p>
            {item.formula && (
              <div className="mt-2 pt-2 border-t border-slate-700 font-mono text-[10px] text-[#00c875] bg-black/30 p-1.5 rounded">
                {item.formula}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6" onClick={() => setActiveTooltip(null)}>
      
      {/* Banner Superior */}
      <div className="bg-white rounded-2xl border border-[#d0d7e5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#0073ea]/10 text-[#0073ea] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dashboard Ejecutivo & ROI Financiero de TI</span>
          </div>
          <h2 className="text-xl font-bold text-[#323338]">Centro de Control de TI & Proyectos de IA</h2>
          <p className="text-xs text-[#676879] mt-0.5">
            Métricas de valor económico generado, horas de trabajo liberadas y estado de cumplimiento de entregas
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToGantt}
            className="flex items-center space-x-1.5 bg-[#f0f3f8] hover:bg-[#e6ebf5] text-[#323338] text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
          >
            <span>Ver Gantt</span>
            <ArrowUpRight className="w-4 h-4 text-[#00c875]" />
          </button>
          <button
            onClick={onNavigateToIntake}
            className="flex items-center space-x-1.5 bg-[#0073ea] hover:bg-[#0060c0] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <span>Solicitudes ({kpis?.pendingRequests || 0})</span>
          </button>
        </div>
      </div>

      {/* Widgets Numéricos Financieros con Tooltips Explicativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Widget 1: Ahorro Económico Mensual */}
        <div className="bg-white rounded-2xl border border-[#d0d7e5] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#676879] font-semibold">
            <div className="flex items-center">
              <span>Ahorro / Valor Mensual</span>
              {renderKpiInfo('money')}
            </div>
            <span className="p-1.5 rounded-lg bg-[#00c875]/10 text-[#00c875]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-[#00c875]">
            {currency}{(kpis?.totalSavedMoneyMonth || 0).toLocaleString()} <span className="text-xs font-bold text-[#676879]">/ mes</span>
          </div>
          <div className="mt-1 text-xs text-[#00854d] font-semibold flex items-center">
            <span>Proyección Anual: {currency}{(kpis?.totalAnnualEconomicImpact || (kpis?.totalSavedMoneyMonth * 12) || 0).toLocaleString()} / año</span>
          </div>
        </div>

        {/* Widget 2: Horas Hombre Liberadas */}
        <div className="bg-white rounded-2xl border border-[#d0d7e5] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#676879] font-semibold">
            <div className="flex items-center">
              <span>Horas Liberadas</span>
              {renderKpiInfo('hours')}
            </div>
            <span className="p-1.5 rounded-lg bg-[#0073ea]/10 text-[#0073ea]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-[#0073ea]">
            {kpis?.totalSavedHoursMonth || 0} <span className="text-sm font-bold text-[#676879]">hrs/mes</span>
          </div>
          <div className="mt-1 text-xs text-[#676879]">
            Capacidad operativa recuperada en la empresa
          </div>
        </div>

        {/* Widget 3: Cumplimiento Cronograma */}
        <div className="bg-white rounded-2xl border border-[#d0d7e5] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#676879] font-semibold">
            <div className="flex items-center">
              <span>Cumplimiento Cronograma</span>
              {renderKpiInfo('onTrack')}
            </div>
            <span className="p-1.5 rounded-lg bg-[#579bfc]/10 text-[#0073ea]">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-[#323338]">
            {kpis?.healthOverview?.onTrackPercentage ?? 100}%
          </div>
          <div className="mt-1 text-xs text-[#676879]">
            {onTrackCount} proyectos al día con la meta mensual
          </div>
        </div>

        {/* Widget 4: Proyectos & Requerimientos */}
        <div className="bg-white rounded-2xl border border-[#d0d7e5] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#676879] font-semibold">
            <span>Proyectos en Portafolio</span>
            <span className="p-1.5 rounded-lg bg-[#fdab3d]/15 text-[#fdab3d]">
              <FolderKanban className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 text-3xl font-black text-[#323338]">
            {kpis?.activeProjects || 0} <span className="text-xs font-semibold text-[#676879]">activos</span>
          </div>
          <div className="mt-1 text-xs text-[#784bd1] font-semibold flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            <span>{kpis?.deployedProjects || 0} completados en producción</span>
          </div>
        </div>

      </div>

      {/* Battery Widget */}
      <div className="bg-white rounded-2xl border border-[#d0d7e5] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center">
              <h3 className="text-sm font-bold text-[#323338]">Batería de Cumplimiento de Portafolio</h3>
              {renderKpiInfo('battery')}
            </div>
            <p className="text-xs text-[#676879]">Proporción de proyectos activos por estado de salud</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <span className="flex items-center space-x-1.5 text-[#00854d]">
              <span className="w-3 h-3 rounded-full bg-[#00c875]"></span>
              <span>A Tiempo ({onTrackCount})</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#b26b00]">
              <span className="w-3 h-3 rounded-full bg-[#fdab3d]"></span>
              <span>En Riesgo ({atRiskCount})</span>
            </span>
            <span className="flex items-center space-x-1.5 text-[#df2f4a]">
              <span className="w-3 h-3 rounded-full bg-[#e2445c]"></span>
              <span>Con Retraso ({delayedCount})</span>
            </span>
          </div>
        </div>

        {/* Barra de Batería */}
        <div className="w-full h-8 rounded-xl bg-[#f0f3f8] flex overflow-hidden p-1 gap-1 border border-[#d0d7e5]">
          {onTrackCount > 0 && (
            <div 
              className="bg-[#00c875] h-full rounded-lg transition-all flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(onTrackCount / totalActive) * 100}%` }}
            >
              {Math.round((onTrackCount / totalActive) * 100)}%
            </div>
          )}
          {atRiskCount > 0 && (
            <div 
              className="bg-[#fdab3d] h-full rounded-lg transition-all flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(atRiskCount / totalActive) * 100}%` }}
            >
              {Math.round((atRiskCount / totalActive) * 100)}%
            </div>
          )}
          {delayedCount > 0 && (
            <div 
              className="bg-[#e2445c] h-full rounded-lg transition-all flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(delayedCount / totalActive) * 100}%` }}
            >
              {Math.round((delayedCount / totalActive) * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Tecnologías & Proyectos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tecnologías */}
        <div className="bg-white rounded-2xl border border-[#d0d7e5] p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#323338] mb-1">Distribución por Tecnología</h3>
          <p className="text-xs text-[#676879] mb-4">Portafolio segmentado por tipo de solución</p>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="flex items-center text-[#784bd1]">
                  <Cpu className="w-3.5 h-3.5 mr-1" />
                  Inteligencia Artificial & LLM
                </span>
                <span className="font-bold">{kpis?.byCategory?.AI_GENAI || 0}</span>
              </div>
              <div className="w-full bg-[#f0f3f8] rounded-full h-2">
                <div className="bg-[#a25ddc] h-2 rounded-full" style={{ width: `${((kpis?.byCategory?.AI_GENAI || 0) / Math.max(1, kpis?.totalProjects || 1)) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="flex items-center text-[#0073ea]">
                  <Workflow className="w-3.5 h-3.5 mr-1" />
                  Automatización & RPA
                </span>
                <span className="font-bold">{kpis?.byCategory?.AUTOMATION_RPA || 0}</span>
              </div>
              <div className="w-full bg-[#f0f3f8] rounded-full h-2">
                <div className="bg-[#579bfc] h-2 rounded-full" style={{ width: `${((kpis?.byCategory?.AUTOMATION_RPA || 0) / Math.max(1, kpis?.totalProjects || 1)) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="flex items-center text-[#00854d]">
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  Portales & Apps Web
                </span>
                <span className="font-bold">{kpis?.byCategory?.WEB_PORTAL || 0}</span>
              </div>
              <div className="w-full bg-[#f0f3f8] rounded-full h-2">
                <div className="bg-[#00c875] h-2 rounded-full" style={{ width: `${((kpis?.byCategory?.WEB_PORTAL || 0) / Math.max(1, kpis?.totalProjects || 1)) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span className="flex items-center text-[#b26b00]">
                  <BarChart3 className="w-3.5 h-3.5 mr-1" />
                  Analítica de Datos & BI
                </span>
                <span className="font-bold">{kpis?.byCategory?.DATA_BI || 0}</span>
              </div>
              <div className="w-full bg-[#f0f3f8] rounded-full h-2">
                <div className="bg-[#fdab3d] h-2 rounded-full" style={{ width: `${((kpis?.byCategory?.DATA_BI || 0) / Math.max(1, kpis?.totalProjects || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Proyectos Clave */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#d0d7e5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-[#323338]">Proyectos Destacados & Retorno Económico</h3>
              <p className="text-xs text-[#676879]">Acceso rápido a repositorios y valor mensual</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {activeProjects.slice(0, 4).map(project => {
              const actualProgress = project.aiEstimatedProgress ?? project.manualProgress;
              const moneySaved = project.savedMoneyMonth || (project.savedHoursMonth * (project.hourlyRate || 18));

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="p-3 rounded-xl bg-[#f8f9fc] hover:bg-[#f0f4ff] border border-[#e6ebf5] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="font-mono text-[10px] font-bold text-[#0073ea] bg-[#0073ea]/10 px-1.5 py-0.2 rounded">
                        {project.code}
                      </span>
                      <span className="text-xs font-bold text-[#323338] group-hover:text-[#0073ea] transition-colors truncate">
                        {project.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#676879]">
                      {project.requesterDepartment} • Ahorro: <strong className="text-[#00854d]">{currency}{moneySaved.toLocaleString()}/mes</strong> ({project.savedHoursMonth} hrs/mes)
                    </div>
                  </div>

                  <div className="w-28 text-right">
                    <span className="text-xs font-bold text-[#00c875]">{actualProgress}%</span>
                    <div className="w-full bg-[#e6ebf5] rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-[#00c875] h-full rounded-full" style={{ width: `${actualProgress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
