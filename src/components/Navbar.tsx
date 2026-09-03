'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  CalendarRange, 
  Inbox, 
  Bot, 
  Database, 
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingRequestsCount: number;
  userRole: 'IT_SPECIALIST' | 'USER';
  setUserRole: (role: 'IT_SPECIALIST' | 'USER') => void;
  onOpenNewProject: () => void;
  onOpenNewRequest: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  pendingRequestsCount,
  userRole,
  setUserRole,
  onOpenNewProject,
  onOpenNewRequest,
  onOpenSettings
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Nexus<span className="text-cyan-400 font-extrabold">TI</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                  Transformación Digital & IA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Gestión de Proyectos, M365 & Auditor de Avance con DeepSeek</p>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center space-x-1">
            {userRole === 'IT_SPECIALIST' ? (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentTab === 'dashboard'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setCurrentTab('gantt')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentTab === 'gantt'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <CalendarRange className="w-4 h-4 text-emerald-400" />
                  <span>Gantt & Cronograma</span>
                </button>

                <button
                  onClick={() => setCurrentTab('kanban')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentTab === 'kanban'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Kanban className="w-4 h-4" />
                  <span>Proyectos & Kanban</span>
                </button>

                <button
                  onClick={() => setCurrentTab('intake')}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentTab === 'intake'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Inbox className="w-4 h-4 text-amber-400" />
                  <span>Buzón Intake</span>
                  {pendingRequestsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded-full text-xs animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentTab('intake-user')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  currentTab === 'intake-user'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Inbox className="w-4 h-4 text-amber-400" />
                <span>Mis Solicitudes de TI</span>
              </button>
            )}
          </nav>

          {/* Acciones y Selector de Perfil M365 */}
          <div className="flex items-center space-x-3">
            {userRole === 'IT_SPECIALIST' ? (
              <button
                onClick={onOpenNewProject}
                className="hidden lg:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>+ Nuevo Proyecto</span>
              </button>
            ) : (
              <button
                onClick={onOpenNewRequest}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <span>+ Nueva Solicitud</span>
              </button>
            )}

            {/* Selector de Rol M365 (Simulación Corporativa) */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
              <button
                onClick={() => setUserRole('IT_SPECIALIST')}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  userRole === 'IT_SPECIALIST'
                    ? 'bg-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista para Especialista TI / Administrador"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Especialista TI</span>
              </button>

              <button
                onClick={() => {
                  setUserRole('USER');
                  setCurrentTab('intake-user');
                }}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  userRole === 'USER'
                    ? 'bg-amber-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Vista para Usuario Solicitante M365"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Usuario M365</span>
              </button>
            </div>

            {/* Botón de Ajustes & Conexión */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
              title="Configuración de Base de Datos SQL Server & DeepSeek"
            >
              <Database className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
