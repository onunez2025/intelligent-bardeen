'use client';

import React, { useState, useRef } from 'react';
import { UserRequest, ProjectCategory, UrgencyLevel, SolutionType, AttachedFile } from '@/types';
import { 
  Inbox, 
  Send, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Cpu, 
  FileCheck,
  Building,
  User,
  Check,
  Paperclip,
  Upload,
  FileSpreadsheet,
  FileText,
  FileImage,
  File,
  X,
  Download
} from 'lucide-react';

interface IntakePortalProps {
  requests: UserRequest[];
  userRole: 'IT_SPECIALIST' | 'USER';
  onSubmitRequest: (data: Partial<UserRequest>) => Promise<any>;
  onConvertRequestToProject: (requestId: string) => Promise<void>;
  onOpenNewRequest?: () => void;
}

export const IntakePortal: React.FC<IntakePortalProps> = ({
  requests,
  userRole,
  onSubmitRequest,
  onConvertRequestToProject
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [businessPain, setBusinessPain] = useState('');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('MEDIUM');
  const [department, setDepartment] = useState('Finanzas & Contabilidad');
  const [requesterName, setRequesterName] = useState('Usuario Corporativo M365');
  const [requesterEmail, setRequesterEmail] = useState('usuario@empresa.com');

  // Tipo de solución y Sistemas corporativos
  const [solutionType, setSolutionType] = useState<SolutionType>('INTEGRATION_EXISTING');
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['SAP']);
  const [otherSystemText, setOtherSystemText] = useState('');

  // Archivos Adjuntos
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const toggleSystem = (systemId: string) => {
    if (selectedSystems.includes(systemId)) {
      setSelectedSystems(selectedSystems.filter(s => s !== systemId));
    } else {
      setSelectedSystems([...selectedSystems, systemId]);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.file) {
            setAttachments(prev => [...prev, data.file]);
          }
        }
      }
    } catch (e) {
      console.error('Error al subir archivo:', e);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <FileSpreadsheet className="w-3.5 h-3.5 text-[#00c875]" />;
    }
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      return <FileImage className="w-3.5 h-3.5 text-[#fdab3d]" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-3.5 h-3.5 text-[#e2445c]" />;
    }
    return <File className="w-3.5 h-3.5 text-[#0073ea]" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const finalSystems = [...selectedSystems];
    if (otherSystemText.trim()) {
      finalSystems.push(otherSystemText.trim());
    }

    setIsSubmitting(true);
    try {
      await onSubmitRequest({
        title,
        description,
        businessPain,
        estimatedImpact,
        urgency,
        requesterDepartment: department,
        requesterName,
        requesterEmail,
        solutionType,
        targetSystems: solutionType === 'INTEGRATION_EXISTING' ? finalSystems : [],
        attachments
      });

      setShowSuccess(true);
      setTitle('');
      setDescription('');
      setBusinessPain('');
      setEstimatedImpact('');
      setSelectedSystems(['SAP']);
      setOtherSystemText('');
      setAttachments([]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyBadge = (urg: UrgencyLevel) => {
    switch (urg) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#e2445c] text-white">Crítica</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#fdab3d] text-white">Alta</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#579bfc] text-white">Media</span>;
      default:
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-200 text-slate-700">Baja</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#d0d7e5] p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#0073ea]/10 text-[#0073ea] text-xs font-bold mb-1.5">
            <Inbox className="w-3.5 h-3.5" />
            <span>Buzón de Requerimientos & Plataformas Corporativas</span>
          </div>
          <h2 className="text-xl font-bold text-[#323338]">
            {userRole === 'IT_SPECIALIST' 
              ? 'Bandeja de Requerimientos de la Organización' 
              : 'Formulario de Solicitud de Transformación Digital & IA'}
          </h2>
          <p className="text-xs text-[#676879] mt-0.5">
            {userRole === 'IT_SPECIALIST'
              ? 'Evalúa las solicitudes con sistemas corporativos asociados y archivos de muestra entregados por los usuarios.'
              : 'Ingresa tu necesidad. El equipo de TI evaluará la mejor solución técnica e integración.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-[#d0d7e5] p-6 shadow-xs">
          <h3 className="text-sm font-bold text-[#323338] mb-1 flex items-center space-x-1.5">
            <Send className="w-4 h-4 text-[#0073ea]" />
            <span>Ingresar Nueva Solicitud</span>
          </h3>
          <p className="text-xs text-[#676879] mb-4">Completa los campos para que la IA clasifique el requerimiento.</p>

          {showSuccess && (
            <div className="bg-[#00c875]/10 border border-[#00c875]/30 rounded-xl p-3.5 mb-4 text-[#00854d] text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#00c875] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">¡Solicitud Enviada!</strong>
                El especialista en TI y el agente DeepSeek han recibido tu requerimiento y tus archivos de muestra.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#323338] font-bold mb-1">Nombre del Requerimiento o Iniciativa *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Automatización de Conciliación Bancaria y Facturación SAP"
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] focus:bg-white focus:border-[#0073ea] focus:outline-none"
              />
            </div>

            {/* Naturaleza del Requerimiento */}
            <div className="bg-[#f8f9fc] p-3 rounded-xl border border-[#d0d7e5] space-y-2">
              <label className="block text-[#323338] font-bold">Naturaleza del Requerimiento:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSolutionType('INTEGRATION_EXISTING')}
                  className={`p-2 rounded-lg font-bold text-xs border text-center transition-all cursor-pointer ${
                    solutionType === 'INTEGRATION_EXISTING'
                      ? 'bg-white border-[#0073ea] text-[#0073ea] shadow-xs'
                      : 'bg-transparent border-slate-300 text-slate-600'
                  }`}
                >
                  Integración / Mejora Existente
                </button>
                <button
                  type="button"
                  onClick={() => setSolutionType('NEW_SOLUTION')}
                  className={`p-2 rounded-lg font-bold text-xs border text-center transition-all cursor-pointer ${
                    solutionType === 'NEW_SOLUTION'
                      ? 'bg-white border-[#0073ea] text-[#0073ea] shadow-xs'
                      : 'bg-transparent border-slate-300 text-slate-600'
                  }`}
                >
                  Nueva Solución Independiente
                </button>
              </div>

              {solutionType === 'INTEGRATION_EXISTING' && (
                <div className="pt-2 border-t border-[#e6ebf5] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#676879] block">Sistemas Corporativos Involucrados:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {enterpriseSystems.map((sys) => {
                      const isSelected = selectedSystems.includes(sys.id);
                      return (
                        <div
                          key={sys.id}
                          onClick={() => toggleSystem(sys.id)}
                          className={`p-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#0073ea]/10 border-[#0073ea] text-[#0073ea]'
                              : 'bg-white border-[#d0d7e5] text-[#323338]'
                          }`}
                        >
                          <span className="truncate">{sys.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#0073ea]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#323338] font-bold mb-1">Área Solicitante</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338] focus:outline-none"
                >
                  <option value="Finanzas & Contabilidad">Finanzas & Contabilidad</option>
                  <option value="Operaciones & Logística">Operaciones & Logística</option>
                  <option value="Comercial & Ventas">Comercial & Ventas</option>
                  <option value="Servicio al Cliente & Soporte">Servicio al Cliente & Soporte</option>
                  <option value="Recursos Humanos">Recursos Humanos</option>
                  <option value="Legal & Cumplimiento">Legal & Cumplimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-[#323338] font-bold mb-1">Prioridad Operativa</label>
                <select
                  value={urgency}
                  onChange={e => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2 text-[#323338] focus:outline-none"
                >
                  <option value="LOW">Planificada (Mejora continua)</option>
                  <option value="MEDIUM">Relevante (Operación normal)</option>
                  <option value="HIGH">Alta (Impacto operativo)</option>
                  <option value="CRITICAL">Crítica / Bloqueante</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#323338] font-bold mb-1">
                Justificación del Negocio & Problemática Actual *
              </label>
              <textarea
                required
                rows={2}
                value={businessPain}
                onChange={e => setBusinessPain(e.target.value)}
                placeholder="Detalla los cuellos de botella operativos o procesos manuales que se realizan en la actualidad..."
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] focus:bg-white focus:border-[#0073ea] focus:outline-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[#323338] font-bold mb-1">
                Descripción del Alcance & Solución Propuesta *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe el objetivo funcional y el resultado que debe entregar la herramienta tecnológica..."
                className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-2.5 text-[#323338] focus:bg-white focus:border-[#0073ea] focus:outline-none leading-relaxed"
              />
            </div>

            {/* Archivos Adjuntos */}
            <div>
              <label className="block text-[#323338] font-bold mb-1 flex items-center space-x-1">
                <Paperclip className="w-3.5 h-3.5 text-[#0073ea]" />
                <span>Adjuntar Archivos de Muestra (Excel, PDF, Capturas)</span>
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-[#d0d7e5] hover:border-[#0073ea] bg-[#f8f9fc] rounded-xl p-3 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.docx,.json"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <span className="text-[11px] font-bold text-[#0073ea] block">+ Seleccionar Archivos</span>
                <span className="text-[10px] text-slate-400">Excel, PDF, Imágenes</span>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {attachments.map(file => (
                    <div key={file.id} className="bg-white p-2 rounded-lg border border-[#e6ebf5] flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1.5 truncate">
                        {getFileIcon(file.name)}
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="w-full flex items-center justify-center space-x-2 bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold py-2.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Analizando con DeepSeek...' : 'Enviar Solicitud'}</span>
            </button>
          </form>
        </div>

        {/* Tabla de Requerimientos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#d0d7e5] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6ebf5]">
            <h3 className="text-sm font-bold text-[#323338]">Requerimientos Recibidos ({requests.length})</h3>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {requests.map(req => (
              <div
                key={req.id}
                className="p-4 rounded-xl bg-[#f8f9fc] border border-[#e6ebf5] hover:border-[#0073ea] transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold text-[#0073ea] bg-[#0073ea]/10 px-1.5 py-0.5 rounded">
                      {req.code}
                    </span>
                    <span className="text-xs font-bold text-[#323338]">{req.requesterDepartment}</span>
                    {getUrgencyBadge(req.urgency)}
                  </div>
                  <span className="text-[11px] text-[#676879]">{req.createdAt.split('T')[0]}</span>
                </div>

                <h4 className="text-xs font-bold text-[#323338] mb-1">{req.title}</h4>
                <p className="text-xs text-[#676879] leading-relaxed mb-2">{req.description}</p>

                {/* Sistemas */}
                {req.targetSystems && req.targetSystems.length > 0 && (
                  <div className="flex items-center space-x-1.5 flex-wrap gap-1 mb-2">
                    <span className="text-[10px] font-bold text-[#676879]">Sistemas:</span>
                    {req.targetSystems.map((sys, idx) => (
                      <span key={idx} className="px-2 py-0.2 rounded bg-[#0073ea]/10 text-[#0073ea] font-bold text-[10px] border border-[#0073ea]/20">
                        {sys}
                      </span>
                    ))}
                  </div>
                )}

                {/* Archivos Adjuntos */}
                {req.attachments && req.attachments.length > 0 && (
                  <div className="bg-[#f0f4ff] p-2.5 rounded-xl border border-[#d0e5ff] space-y-1 mb-2">
                    <span className="text-[10px] font-bold text-[#0073ea] flex items-center space-x-1">
                      <Paperclip className="w-3 h-3" />
                      <span>Archivos adjuntos ({req.attachments.length}):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {req.attachments.map((file) => (
                        <a
                          key={file.id}
                          href={file.url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white px-2 py-0.5 rounded-md border border-[#d0d7e5] hover:border-[#0073ea] text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                        >
                          {getFileIcon(file.name)}
                          <span className="text-[#323338] truncate max-w-[150px]">{file.name}</span>
                          <Download className="w-2.5 h-2.5 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white p-3 rounded-lg border border-[#e6ebf5] text-xs space-y-1 mb-3">
                  <div className="text-[#676879]">
                    <strong className="text-[#323338]">Dolor:</strong> {req.businessPain}
                  </div>
                  {req.estimatedImpact && (
                    <div className="text-[#00854d] font-medium">
                      <strong className="text-[#323338]">Impacto:</strong> {req.estimatedImpact}
                    </div>
                  )}
                </div>

                {req.aiAnalysis && (
                  <div className="bg-[#a25ddc]/10 border border-[#a25ddc]/30 rounded-lg p-3 text-xs mb-3 text-[#784bd1]">
                    <div className="font-bold flex items-center space-x-1 mb-0.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Diagnóstico DeepSeek: {req.aiCategory || 'Solución Digital'}</span>
                    </div>
                    <p className="text-[11px] text-[#323338] leading-relaxed whitespace-pre-line">
                      {req.aiAnalysis}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#e6ebf5] text-xs">
                  <span className="text-[#676879] flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Solicitante: <strong className="text-[#323338]">{req.requesterName}</strong></span>
                  </span>

                  {userRole === 'IT_SPECIALIST' && req.status !== 'CONVERTED' ? (
                    <button
                      onClick={() => onConvertRequestToProject(req.id)}
                      className="flex items-center space-x-1 bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Convertir a Proyecto TI</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-[#00c875]/15 text-[#00854d]">
                      {req.status === 'CONVERTED' ? 'Convertido a Proyecto Activo' : 'En Evaluación'}
                    </span>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
