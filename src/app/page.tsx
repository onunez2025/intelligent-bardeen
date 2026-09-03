'use client';

import React, { useState, useEffect } from 'react';
import { Project, UserRequest, ProjectStatus } from '@/types';
import { exportProjectsToExcel } from '@/lib/excel_export';
import { useAuth } from '@/context/AuthContext';
import { CorporateLogin } from '@/components/CorporateLogin';
import { MondaySidebar } from '@/components/MondaySidebar';
import { MondayHeader } from '@/components/MondayHeader';
import { MondayTable } from '@/components/MondayTable';
import { GanttChart } from '@/components/GanttChart';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { IntakePortal } from '@/components/IntakePortal';
import { ProjectDetailModal } from '@/components/ProjectDetailModal';
import { NewProjectModal } from '@/components/NewProjectModal';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  const { user, isAuthenticated, login, quickLoginAsSpecialist, quickLoginAsUser } = useAuth();
  
  const [currentTab, setCurrentTab] = useState<string>('table');
  const userRole = user?.role || 'IT_SPECIALIST';
  
  const [projects, setProjects] = useState<Array<Project & { gantt?: any }>>([]);
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modales
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, reqRes] = await Promise.all([
        fetch('/api/dashboard/kpis'),
        fetch('/api/requests')
      ]);

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json();
        setKpis(kpiData.data.kpis);
        setProjects(kpiData.data.projects || []);
      }

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.data || []);
      }
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Crear Proyecto
  const handleCreateProject = async (projectData: Partial<Project>) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        await fetchData();
        setIsNewProjectOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Actualizar Proyecto
  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await fetchData();
        if (selectedProject && selectedProject.id === id) {
          const updated = await res.json();
          setSelectedProject(updated.data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Crear Solicitud Intake
  const handleCreateRequest = async (requestData: Partial<UserRequest>) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Convertir Solicitud a Proyecto
  const handleConvertRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData();
        setSelectedProject(data.data.project);
        setCurrentTab('table');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Evaluar con DeepSeek
  const handleRunAiEvaluation = async (projectId: string, repoNotes: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/evaluate-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoNotes })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchData();
        return data;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'SUBMITTED' || r.status === 'REVIEWING').length;

  // Si no está autenticado, mostrar pantalla de Login Corporativo Microsoft 365
  if (!isAuthenticated) {
    return <CorporateLogin />;
  }

  return (
    <div className="flex min-h-screen bg-[#f6f7fb] text-[#323338] font-sans antialiased">
      
      {/* Sidebar Izquierda Estilo Monday.com */}
      <MondaySidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        pendingRequestsCount={pendingRequestsCount}
        userRole={userRole}
        setUserRole={(newRole) => {
          if (newRole === 'IT_SPECIALIST') quickLoginAsSpecialist();
          else quickLoginAsUser();
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
      />

      {/* Área Principal de Contenido */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header Superior Monday.com */}
        <MondayHeader
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          pendingRequestsCount={pendingRequestsCount}
          userRole={userRole}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onExportExcel={() => exportProjectsToExcel(projects)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* Vistas */}
        <main className="flex-1">
          {loading && projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 space-y-3">
              <div className="w-8 h-8 border-3 border-[#0073ea]/20 border-t-[#0073ea] rounded-full animate-spin"></div>
              <p className="text-xs text-[#676879] font-medium">Cargando tablero de TI...</p>
            </div>
          ) : (
            <>
              {/* TABLA PRINCIPAL (Vista por defecto Monday) */}
              {currentTab === 'table' && userRole === 'IT_SPECIALIST' && (
                <MondayTable
                  projects={projects}
                  onSelectProject={(proj) => setSelectedProject(proj)}
                  onUpdateStatus={(id, status) => handleUpdateProject(id, { status })}
                  onOpenNewProject={() => setIsNewProjectOpen(true)}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                />
              )}

              {/* DIAGRAMA DE GANTT */}
              {currentTab === 'gantt' && userRole === 'IT_SPECIALIST' && (
                <GanttChart
                  projects={projects}
                  onSelectProject={(proj) => setSelectedProject(proj)}
                />
              )}

              {/* TABLERO KANBAN */}
              {currentTab === 'kanban' && userRole === 'IT_SPECIALIST' && (
                <KanbanBoard
                  projects={projects}
                  onSelectProject={(proj) => setSelectedProject(proj)}
                  onUpdateStatus={(id, status) => handleUpdateProject(id, { status })}
                  onOpenNewProject={() => setIsNewProjectOpen(true)}
                />
              )}

              {/* DASHBOARD EJECUTIVO */}
              {currentTab === 'dashboard' && userRole === 'IT_SPECIALIST' && (
                <ExecutiveDashboard
                  kpis={kpis}
                  projects={projects}
                  onSelectProject={(proj) => setSelectedProject(proj)}
                  onNavigateToGantt={() => setCurrentTab('gantt')}
                  onNavigateToIntake={() => setCurrentTab('intake')}
                />
              )}

              {/* BUZÓN DE INTAKE */}
              {currentTab === 'intake' && (
                <IntakePortal
                  requests={requests}
                  userRole={userRole}
                  onSubmitRequest={handleCreateRequest}
                  onConvertRequestToProject={handleConvertRequest}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALES */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdateProject={handleUpdateProject}
          onRunAiEvaluation={handleRunAiEvaluation}
        />
      )}

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
