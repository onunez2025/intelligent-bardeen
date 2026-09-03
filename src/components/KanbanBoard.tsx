'use client';

import React from 'react';
import { Project, ProjectStatus, ProjectCategory } from '@/types';
import { 
  FolderGit2, 
  Clock, 
  ArrowRight, 
  Plus,
  Edit3,
  Calendar
} from 'lucide-react';

interface KanbanBoardProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
  onOpenNewProject: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projects,
  onSelectProject,
  onUpdateStatus,
  onOpenNewProject
}) => {
  const columns: { status: ProjectStatus; title: string; color: string }[] = [
    { status: 'BACKLOG', title: 'Por Iniciar', color: '#94a3b8' },
    { status: 'DISCOVERY', title: 'Discovery & Levantamiento', color: '#579bfc' },
    { status: 'IN_PROGRESS', title: 'En Desarrollo Activo', color: '#fdab3d' },
    { status: 'UAT_TESTING', title: 'Pruebas UAT', color: '#a25ddc' },
    { status: 'DEPLOYED', title: 'Listo / Producción', color: '#00c875' },
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tablero Kanban de Flujo de Trabajo</h2>
          <p className="text-xs text-slate-500">Gestión ágil del ciclo de entrega por etapas operativas</p>
        </div>
        <button
          onClick={onOpenNewProject}
          className="flex items-center space-x-1.5 bg-[#0073ea] hover:bg-[#0060c0] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Columnas Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {columns.map(col => {
          const colProjects = projects.filter(p => p.status === col.status);

          return (
            <div 
              key={col.status}
              className="bg-[#f8f9fc] rounded-2xl p-3 flex flex-col min-h-[600px] border border-[#e2e8f0]"
            >
              {/* Header de la columna */}
              <div className="flex items-center justify-between pb-3 px-1 border-b border-[#e2e8f0] mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                  <span className="font-bold text-xs text-slate-800 tracking-tight">{col.title}</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-slate-500 border border-slate-200">
                  {colProjects.length}
                </span>
              </div>

              {/* Tarjetas */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {colProjects.map(project => {
                  const actualProgress = project.aiEstimatedProgress ?? project.manualProgress;
                  const moneySaved = project.savedMoneyMonth || (project.savedHoursMonth * (project.hourlyRate || 18));

                  return (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200 hover:border-[#0073ea]/40 hover:shadow-xs transition-all cursor-pointer space-y-3 group"
                    >
                      {/* Código & Área */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {project.code}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate max-w-[120px] font-medium">
                          {project.requesterDepartment}
                        </span>
                      </div>

                      {/* Nombre */}
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0073ea] transition-colors leading-snug">
                        {project.name}
                      </h4>

                      {/* Sistemas */}
                      {project.targetSystems && project.targetSystems.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {project.targetSystems.slice(0, 3).map((sys, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-50 text-slate-600 font-mono text-[9px] font-medium border border-slate-200">
                              {sys}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Barra de Progreso */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                          <span>Avance Real</span>
                          <span className="text-slate-900">{actualProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#00c875] h-full rounded-full transition-all"
                            style={{ width: `${actualProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer de Tarjeta */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{project.targetEndDate.split('-').slice(1).join('/')}</span>
                        </div>

                        <div className="font-bold text-[#00854d]">
                          ${moneySaved.toLocaleString()}/m
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
