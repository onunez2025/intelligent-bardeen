'use client';

import React, { useState } from 'react';
import { Project, ProjectCategory, ProjectStatus } from '@/types';
import { X, FolderPlus, FolderGit2 } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: Partial<Project>) => Promise<void>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('AI_GENAI');
  const [status, setStatus] = useState<ProjectStatus>('DISCOVERY');
  const [requesterName, setRequesterName] = useState('');
  const [requesterDepartment, setRequesterDepartment] = useState('Finanzas & Contabilidad');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [savedHoursMonth, setSavedHoursMonth] = useState<number>(30);
  const [estimatedHours, setEstimatedHours] = useState<number>(80);
  const [roiSummary, setRoiSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateProject({
        name,
        description,
        category,
        status,
        requesterName: requesterName || 'Usuario Corporativo',
        requesterDepartment,
        startDate,
        targetEndDate,
        repositoryUrl,
        savedHoursMonth: Number(savedHoursMonth) || 0,
        estimatedHours: Number(estimatedHours) || 80,
        roiSummary: roiSummary || `Ahorro estimado de ${savedHoursMonth} horas/mes.`
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#d0d7e5] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#f8f9fc] px-6 py-4 border-b border-[#e6ebf5] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#0073ea]/10 text-[#0073ea]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#323338]">Crear Nuevo Proyecto de TI & IA</h2>
              <p className="text-xs text-[#676879]">Configura alcance, fechas de entrega, repositorio y ROI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#676879] hover:text-[#323338] hover:bg-[#e6ebf5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-[#323338] font-bold mb-1">Nombre del Proyecto *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Pipeline RAG con DeepSeek para Políticas de la Empresa"
              className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] focus:bg-white focus:border-[#0073ea] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#323338] font-bold mb-1">Categoría Tecnológica</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ProjectCategory)}
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338]"
              >
                <option value="AI_GENAI">Inteligencia Artificial & LLM</option>
                <option value="AUTOMATION_RPA">Automatización & RPA</option>
                <option value="WEB_PORTAL">Portal Web Corporativo</option>
                <option value="DATA_BI">Analítica de Datos & BI</option>
                <option value="API_INTEGRATION">Integración de APIs</option>
                <option value="OTHER">TI General</option>
              </select>
            </div>

            <div>
              <label className="block text-[#323338] font-bold mb-1">Estado Inicial</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ProjectStatus)}
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338]"
              >
                <option value="BACKLOG">Por Iniciar</option>
                <option value="DISCOVERY">Discovery & Levantamiento</option>
                <option value="IN_PROGRESS">En Desarrollo Activo</option>
                <option value="UAT_TESTING">Pruebas UAT</option>
                <option value="DEPLOYED">Listo / Producción</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#323338] font-bold mb-1">Usuario Solicitante</label>
              <input
                type="text"
                value={requesterName}
                onChange={e => setRequesterName(e.target.value)}
                placeholder="Nombre del usuario clave"
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338]"
              />
            </div>

            <div>
              <label className="block text-[#323338] font-bold mb-1">Área Solicitante</label>
              <input
                type="text"
                value={requesterDepartment}
                onChange={e => setRequesterDepartment(e.target.value)}
                placeholder="Finanzas, RRHH, etc."
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#323338] font-bold mb-1">Descripción del Requerimiento / Solución *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explica qué problema soluciona y cómo funciona la solución propuesta..."
              className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] focus:bg-white focus:border-[#0073ea] focus:outline-none"
            />
          </div>

          {/* Enlace al Repositorio */}
          <div>
            <label className="block text-[#323338] font-bold mb-1 flex items-center">
              <FolderGit2 className="w-3.5 h-3.5 mr-1 text-[#0073ea]" />
              <span>URL del Repositorio de Código (GitHub, GitLab, Azure DevOps)</span>
            </label>
            <input
              type="text"
              value={repositoryUrl}
              onChange={e => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/organizacion/mi-proyecto-ia"
              className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] font-mono text-[11px]"
            />
          </div>

          {/* Fechas para el Gantt */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#323338] font-bold mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338]"
              />
            </div>

            <div>
              <label className="block text-[#323338] font-bold mb-1">Fecha Fin Prevista (Target)</label>
              <input
                type="date"
                value={targetEndDate}
                onChange={e => setTargetEndDate(e.target.value)}
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338]"
              />
            </div>
          </div>

          {/* ROI e Impacto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#323338] font-bold mb-1">Ahorro Estimado (Horas/Mes) - ROI</label>
              <input
                type="number"
                value={savedHoursMonth}
                onChange={e => setSavedHoursMonth(Number(e.target.value))}
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338]"
              />
            </div>

            <div>
              <label className="block text-[#323338] font-bold mb-1">Horas de Desarrollo Estimadas</label>
              <input
                type="number"
                value={estimatedHours}
                onChange={e => setEstimatedHours(Number(e.target.value))}
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#e6ebf5] flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#676879] hover:bg-[#f0f3f8] font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Proyecto'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
