'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Table, 
  CalendarRange, 
  Kanban, 
  Inbox, 
  Database, 
  Plus, 
  Shield, 
  ExternalLink,
  Send,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface MondaySidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingRequestsCount: number;
  userRole: 'IT_SPECIALIST' | 'USER';
  setUserRole: (role: 'IT_SPECIALIST' | 'USER') => void;
  onOpenSettings: () => void;
  onOpenNewProject: () => void;
}

export const MondaySidebar: React.FC<MondaySidebarProps> = ({
  currentTab,
  setCurrentTab,
  pendingRequestsCount,
  userRole,
  setUserRole,
  onOpenSettings,
  onOpenNewProject
}) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-[#181b2a] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-[#262b42] select-none z-30">
      
      {/* Parte Superior: Workspace & Navegación */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        
        {/* Logo & Header: TI Innovation Portal */}
        <div className="p-4 border-b border-[#262b42] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo Vectorial Moderno TI Innovation */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0052cc] via-[#0073ea] to-[#00c875] p-[1.5px] shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#181b2a] rounded-[10px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="#0073ea" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8L16 10.5V14.5L12 17L8 14.5V10.5L12 8Z" fill="#00c875" fillOpacity="0.8" />
                  <circle cx="12" cy="12.5" r="1.5" fill="#ffffff" />
                </svg>
              </div>
            </div>

            <div>
              <div className="font-bold text-white text-sm tracking-tight flex items-center space-x-1.5">
                <span>TI Innovation</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Digital Hub & AI Portal</p>
            </div>
          </div>
        </div>

        {/* Selector de Rol M365 */}
        <div className="p-3 mx-3 my-3 bg-[#21263d] rounded-xl border border-[#303756]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Shield className="w-3 h-3 text-slate-400" />
            <span>Perfil de Acceso</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <button
              onClick={() => setUserRole('IT_SPECIALIST')}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                userRole === 'IT_SPECIALIST'
                  ? 'bg-[#0073ea] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#2c3350]'
              }`}
            >
              Especialista TI
            </button>
            <button
              onClick={() => {
                setUserRole('USER');
                setCurrentTab('intake');
              }}
              className={`py-1.5 px-2 rounded-lg font-medium transition-all ${
                userRole === 'USER'
                  ? 'bg-[#fdab3d] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#2c3350]'
              }`}
            >
              Usuario M365
            </button>
          </div>
        </div>

        {/* Tableros y Vistas Principales */}
        <div className="px-3 py-2 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Gestión de Portafolio</span>
          </div>

          {userRole === 'IT_SPECIALIST' ? (
            <>
              {/* Tabla Principal */}
              <button
                onClick={() => setCurrentTab('table')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'table'
                    ? 'bg-[#0073ea] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-[#242a44] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Table className="w-4 h-4 text-[#579bfc]" />
                  <span>Tabla de Proyectos</span>
                </div>
              </button>

              {/* Diagrama de Gantt */}
              <button
                onClick={() => setCurrentTab('gantt')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'gantt'
                    ? 'bg-[#0073ea] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-[#242a44] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CalendarRange className="w-4 h-4 text-[#00c875]" />
                  <span>Cronograma & Gantt</span>
                </div>
              </button>

              {/* Tablero Kanban */}
              <button
                onClick={() => setCurrentTab('kanban')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'kanban'
                    ? 'bg-[#0073ea] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-[#242a44] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Kanban className="w-4 h-4 text-[#a25ddc]" />
                  <span>Tablero Kanban</span>
                </div>
              </button>

              {/* Dashboard Ejecutivo */}
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-[#0073ea] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-[#242a44] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <LayoutDashboard className="w-4 h-4 text-[#fdab3d]" />
                  <span>Dashboard Ejecutivo & ROI</span>
                </div>
              </button>

              {/* Buzón de Intake */}
              <button
                onClick={() => setCurrentTab('intake')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  currentTab === 'intake'
                    ? 'bg-[#0073ea] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-[#242a44] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Inbox className="w-4 h-4 text-[#ff5ac4]" />
                  <span>Buzón de Intake</span>
                </div>
                {pendingRequestsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#e2445c] text-white text-[10px] font-bold">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setCurrentTab('intake')}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[#0073ea] text-white"
            >
              <Inbox className="w-4 h-4 text-white" />
              <span>Mis Solicitudes de TI</span>
            </button>
          )}
        </div>

        {/* Link directo al Portal de Solicitudes */}
        <div className="p-3 mx-3 mt-3 bg-[#1d2238] rounded-xl border border-[#2b3352]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Enlace para Usuarios</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-2">
            URL directa para compartir con colaboradores de la empresa:
          </p>
          <Link
            href="/solicitud"
            target="_blank"
            className="w-full flex items-center justify-center space-x-1.5 bg-[#2c3454] hover:bg-[#39436c] text-white text-xs font-bold py-1.5 px-2 rounded-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-[#579bfc]" />
            <span>Abrir /solicitud</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Acciones Rápidas */}
        {userRole === 'IT_SPECIALIST' && (
          <div className="p-3 mx-3 mt-2">
            <button
              onClick={onOpenNewProject}
              className="w-full flex items-center justify-center space-x-2 bg-[#0073ea] hover:bg-[#0060c0] text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        )}

      </div>

      {/* Parte Inferior: Perfil, Configuración y Cerrar Sesión */}
      <div className="p-3 border-t border-[#262b42] bg-[#141724] space-y-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[#242a44] transition-colors cursor-pointer"
        >
          <Database className="w-4 h-4 text-[#579bfc]" />
          <span>Azure SQL & ti_projects</span>
        </button>

        {/* Usuario Activo M365 con Botón de Cerrar Sesión */}
        <div className="pt-2 border-t border-[#262b42]/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
            <div className="w-7 h-7 rounded-full bg-[#0073ea] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.avatarInitials || (userRole === 'IT_SPECIALIST' ? 'ON' : 'CM')}
            </div>
            <div className="flex-1 truncate">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || (userRole === 'IT_SPECIALIST' ? 'Orlando Núñez' : 'Carlos Mendoza')}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {user?.department || (userRole === 'IT_SPECIALIST' ? 'Transformación Digital & IA' : 'Finanzas & Contabilidad')}
              </div>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#e2445c] hover:bg-[#e2445c]/10 transition-colors cursor-pointer shrink-0"
            title="Cerrar sesión e ir a la pantalla de Login M365"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
};
