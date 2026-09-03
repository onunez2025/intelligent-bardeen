'use client';

import React from 'react';
import { 
  Table, 
  CalendarRange, 
  Kanban, 
  LayoutDashboard, 
  Inbox, 
  Plus, 
  Search, 
  Filter, 
  FileSpreadsheet
} from 'lucide-react';

interface MondayHeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onOpenNewProject: () => void;
  onExportExcel?: () => void;
  pendingRequestsCount: number;
  userRole?: 'IT_SPECIALIST' | 'USER';
}

export const MondayHeader: React.FC<MondayHeaderProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onOpenNewProject,
  onExportExcel,
  pendingRequestsCount,
  userRole
}) => {
  const tabs = [
    { id: 'table', label: 'Tabla Principal', icon: Table },
    { id: 'gantt', label: 'Cronograma Mensual (Gantt)', icon: CalendarRange },
    { id: 'kanban', label: 'Tablero Kanban', icon: Kanban },
    { id: 'dashboard', label: 'Dashboard Ejecutivo & ROI', icon: LayoutDashboard },
    { id: 'intake', label: `Buzón Intake (${pendingRequestsCount})`, icon: Inbox },
  ];

  return (
    <header className="bg-white border-b border-[#d0d7e5] px-6 pt-4 pb-2.5 flex flex-col justify-between shadow-2xs sticky top-0 z-20">
      
      {/* Título Superior y Acciones Principales */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-[#323338] tracking-tight">TI Innovation Portal</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0073ea]/10 text-[#0073ea] border border-[#0073ea]/20">
              Transformación Digital & IA
            </span>
          </div>
          <p className="text-xs text-[#676879] mt-0.5">
            Control de requerimientos, integraciones ERP/CRM, cronogramas y ROI económico
          </p>
        </div>

        {/* Botones de Acción */}
        {userRole !== 'USER' && (
          <div className="flex items-center space-x-2">
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="flex items-center space-x-1.5 bg-[#00c875]/10 hover:bg-[#00c875]/20 text-[#00854d] border border-[#00c875]/30 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                title="Descargar reporte completo en formato Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#00c875]" />
                <span>Exportar Excel</span>
              </button>
            )}

            <button
              onClick={onOpenNewProject}
              className="flex items-center space-x-1.5 bg-[#0073ea] hover:bg-[#0060c0] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Proyecto</span>
            </button>
          </div>
        )}
      </div>

      {/* Barra de Filtros y Selector de Vistas con Espaciado Cómodo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-[#f0f3f8] pt-2.5">
        
        {/* Pestañas de Vista Estilo Monday */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none items-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[#0073ea] bg-[#0073ea]/10 shadow-2xs font-bold'
                    : 'text-[#676879] hover:text-[#323338] hover:bg-[#f6f7fb]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0073ea]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador y Filtro por Categoría */}
        <div className="flex items-center space-x-2 py-0.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar proyecto o sistema..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#f6f7fb] border border-[#d0d7e5] rounded-xl pl-8 pr-3 py-2 text-xs text-[#323338] placeholder-slate-400 focus:bg-white focus:border-[#0073ea] focus:outline-none w-52 shadow-2xs transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#f6f7fb] border border-[#d0d7e5] rounded-xl px-3 py-2 text-xs text-[#323338] font-semibold focus:bg-white focus:border-[#0073ea] focus:outline-none cursor-pointer shadow-2xs transition-colors"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="AI_GENAI">IA & GenAI</option>
              <option value="AUTOMATION_RPA">Automatización & RPA</option>
              <option value="WEB_PORTAL">Portales Web</option>
              <option value="DATA_BI">Power BI & Datos</option>
              <option value="API_INTEGRATION">Integraciones API</option>
            </select>
          </div>
        </div>

      </div>

    </header>
  );
};
