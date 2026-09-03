'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UserRequest, UrgencyLevel, SolutionType, AttachedFile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  Inbox, 
  Send, 
  CheckCircle2, 
  Clock, 
  Building, 
  User, 
  FileText, 
  HelpCircle, 
  ArrowLeft,
  ArrowRight,
  Search,
  Layers,
  Sparkles,
  Cpu,
  Check,
  Paperclip,
  Upload,
  FileSpreadsheet,
  FileCode,
  FileImage,
  File,
  X,
  Download,
  LogOut,
  ChevronRight,
  Shield,
  Layers2,
  Workflow,
  PlusCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SolicitudPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'FORM' | 'MY_REQUESTS'>('FORM');
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);

  // Formulario con autocompletado del usuario autenticado
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [businessPain, setBusinessPain] = useState('');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('MEDIUM');
  const [department, setDepartment] = useState(user?.department || 'Finanzas & Contabilidad');
  const [requesterName, setRequesterName] = useState(user?.name || 'Orlando Núñez');
  const [requesterEmail, setRequesterEmail] = useState(user?.email || 'onunez@gruposole.com.pe');

  useEffect(() => {
    if (user) {
      setRequesterName(user.name);
      setRequesterEmail(user.email);
      setDepartment(user.department);
    }
  }, [user]);

  // Naturaleza de la Solución y Sistemas corporativos
  const [solutionType, setSolutionType] = useState<SolutionType>('INTEGRATION_EXISTING');
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['SAP']);
  const [otherSystemText, setOtherSystemText] = useState('');

  // Archivos Adjuntos
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enterpriseSystems = [
    { id: 'SAP', label: 'SAP ERP Central (Finanzas, MM, SD, Inventarios)' },
    { id: 'C4C', label: 'SAP C4C (Cloud for Customer / CRM Comercial)' },
    { id: 'FSM', label: 'SAP FSM (Field Service Management / Soporte)' },
    { id: 'Sig Web', label: 'SIG Web Corporativo' },
    { id: 'Beetrack', label: 'Beetrack (Logística, Rutas & Despachos)' },
    { id: 'Punto de Venta', label: 'Punto de Venta (POS Tiendas)' },
    { id: 'Siatc', label: 'SIATC' },
    { id: 'Microsoft 365', label: 'Microsoft 365 (Teams, SharePoint, Excel, Outlook)' },
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <FileSpreadsheet className="w-4 h-4 text-[#00c875]" />;
    }
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
      return <FileImage className="w-4 h-4 text-[#fdab3d]" />;
    }
    if (ext === 'pdf') {
      return <FileText className="w-4 h-4 text-[#e2445c]" />;
    }
    if (ext === 'json' || ext === 'xml') {
      return <FileCode className="w-4 h-4 text-[#a25ddc]" />;
    }
    return <File className="w-4 h-4 text-[#0073ea]" />;
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !businessPain.trim()) return;

    const finalSystems = [...selectedSystems];
    if (otherSystemText.trim()) {
      finalSystems.push(otherSystemText.trim());
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCreatedTicket(data.data.code);
        setShowSuccess(true);
        setTitle('');
        setDescription('');
        setBusinessPain('');
        setEstimatedImpact('');
        setAttachments([]);
        await fetchRequests();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONVERTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#00c875]/15 text-[#00854d]">Proyecto Activo en TI</span>;
      case 'REVIEWING':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#fdab3d]/15 text-[#b26b00]">En Evaluación Técnica</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#0073ea]/15 text-[#0073ea]">Recibido</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#323338] font-sans antialiased">
      
      {/* Header Corporativo M365 */}
      <header className="bg-white border-b border-[#e6ebf5] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#0073ea] text-white flex items-center justify-center font-bold shadow-xs">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-[#323338]">Portal de Solicitudes & Requerimientos de TI</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                  Grupo Sole
                </span>
              </div>
              <p className="text-[11px] text-[#676879]">Recepción formal de iniciativas, integraciones de sistemas y automatizaciones</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-xl text-xs">
                <div className="w-6 h-6 rounded-full bg-[#0073ea] text-white font-bold text-[10px] flex items-center justify-center">
                  {user.avatarInitials}
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-800 leading-tight text-[11px]">{user.name}</div>
                  <div className="text-[9px] text-slate-500">{user.department}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="ml-1 p-1 text-slate-400 hover:text-[#e2445c] transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <Link
              href="/"
              className="flex items-center space-x-1.5 text-xs text-slate-700 hover:text-[#0073ea] font-bold bg-white border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tablero TI</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Selector de Pestañas Superior */}
        <div className="flex border-b border-[#d0d7e5] mb-6 space-x-6">
          <button
            onClick={() => setActiveTab('FORM')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'FORM'
                ? 'text-[#0073ea] border-[#0073ea]'
                : 'text-[#676879] border-transparent hover:text-[#323338]'
            }`}
          >
            Formulario de Registro de Requerimiento
          </button>
          <button
            onClick={() => setActiveTab('MY_REQUESTS')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center space-x-2 ${
              activeTab === 'MY_REQUESTS'
                ? 'text-[#0073ea] border-[#0073ea]'
                : 'text-[#676879] border-transparent hover:text-[#323338]'
            }`}
          >
            <span>Mis Requerimientos Registrados</span>
            {requests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {/* PESTAÑA 1: FORMULARIO FORMAL CORPORATIVO */}
        {activeTab === 'FORM' && (
          <div className="space-y-6">
            
            {/* Mensaje de Éxito */}
            {showSuccess && (
              <div className="bg-[#00c875]/10 border border-[#00c875]/30 rounded-2xl p-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#00c875] text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#00854d]">¡Requerimiento Registrado Exitosamente!</h3>
                <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  Se ha generado el expediente formal <strong className="font-mono text-[#00854d] bg-white px-2 py-0.5 rounded border border-[#00c875]/30">{createdTicket}</strong>. El equipo de Tecnologías de la Información evaluará la factibilidad y se pondrá en contacto.
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => setShowSuccess(false)}
                    className="bg-[#00c875] hover:bg-[#00b067] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    Registrar Otro Requerimiento
                  </button>
                </div>
              </div>
            )}

            {!showSuccess && (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* BLOQUE 1: IDENTIFICACIÓN DEL REQUERIMIENTO */}
                <div className="bg-white border border-[#d0d7e5] rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 border-b border-[#f0f3f8] pb-3">
                    <div className="p-1.5 rounded-lg bg-[#0073ea]/10 text-[#0073ea]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">1. Identificación de la Solicitud</h3>
                      <p className="text-[11px] text-slate-500">Datos generales del requerimiento y área responsable</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Nombre del Requerimiento o Iniciativa <span className="text-[#e2445c]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ej. Automatización del Proceso de Conciliación Bancaria y Facturación Electrónica"
                      className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0073ea] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Área Solicitante</label>
                      <input
                        type="text"
                        disabled
                        value={department}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Responsable / Solicitante</label>
                      <input
                        type="text"
                        disabled
                        value={requesterName}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Prioridad Operativa</label>
                      <select
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as any)}
                        className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none"
                      >
                        <option value="LOW">Planificada (Mejora continua a mediano plazo)</option>
                        <option value="MEDIUM">Relevante (Impacta la operación del área)</option>
                        <option value="HIGH">Crítica / Bloqueante (Afecta facturación o entregas)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BLOQUE 2: NATURALEZA DEL REQUERIMIENTO Y SISTEMAS */}
                <div className="bg-white border border-[#d0d7e5] rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 border-b border-[#f0f3f8] pb-3">
                    <div className="p-1.5 rounded-lg bg-[#0073ea]/10 text-[#0073ea]">
                      <Layers2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">2. Naturaleza del Requerimiento & Sistemas Corporativos</h3>
                      <p className="text-[11px] text-slate-500">Selecciona si la solución interactúa con sistemas vigentes o es un desarrollo independiente</p>
                    </div>
                  </div>

                  {/* Selector Interactivo de Tipo de Solución */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() => setSolutionType('INTEGRATION_EXISTING')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        solutionType === 'INTEGRATION_EXISTING'
                          ? 'border-[#0073ea] bg-[#0073ea]/5 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="solutionType"
                          checked={solutionType === 'INTEGRATION_EXISTING'}
                          onChange={() => setSolutionType('INTEGRATION_EXISTING')}
                          className="w-4 h-4 text-[#0073ea]"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                            <Workflow className="w-3.5 h-3.5 text-[#0073ea]" />
                            <span>Integración / Mejora sobre Sistema Existente</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Involucra intercambio de datos con SAP ERP, C4C, Beetrack, POS, etc.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setSolutionType('NEW_SOLUTION')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        solutionType === 'NEW_SOLUTION'
                          ? 'border-[#0073ea] bg-[#0073ea]/5 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="solutionType"
                          checked={solutionType === 'NEW_SOLUTION'}
                          onChange={() => setSolutionType('NEW_SOLUTION')}
                          className="w-4 h-4 text-[#0073ea]"
                        />
                        <div className="flex-1">
                          <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                            <PlusCircle className="w-3.5 h-3.5 text-[#0073ea]" />
                            <span>Desarrollo de Nueva Solución Independiente</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Nuevo portal web, aplicativo independiente, bot o dashboard desde cero.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sistemas Corporativos (Se muestra cuando es Integración) */}
                  {solutionType === 'INTEGRATION_EXISTING' && (
                    <div className="bg-[#f8f9fc] border border-slate-200 rounded-2xl p-4 space-y-2 mt-3">
                      <div className="text-xs font-bold text-slate-800">
                        Selecciona los Sistemas Corporativos Involucrados:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {enterpriseSystems.map(sys => (
                          <label
                            key={sys.id}
                            className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              selectedSystems.includes(sys.id)
                                ? 'bg-white border-[#0073ea] text-[#0073ea] font-semibold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSystems.includes(sys.id)}
                              onChange={() => toggleSystem(sys.id)}
                              className="rounded text-[#0073ea]"
                            />
                            <span className="truncate">{sys.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* BLOQUE 3: JUSTIFICACIÓN DEL NEGOCIO & ALCANCE FUNCIONAL */}
                <div className="bg-white border border-[#d0d7e5] rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 border-b border-[#f0f3f8] pb-3">
                    <div className="p-1.5 rounded-lg bg-[#0073ea]/10 text-[#0073ea]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">3. Justificación del Negocio & Alcance Funcional</h3>
                      <p className="text-[11px] text-slate-500">Detalla la necesidad operativa y el beneficio cuantificable esperado</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Justificación del Negocio & Problemática Actual <span className="text-[#e2445c]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={businessPain}
                      onChange={e => setBusinessPain(e.target.value)}
                      placeholder="Describe la problemática actual, cuellos de botella o procesos manuales que se realizan en la actualidad..."
                      className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-[#0073ea] focus:outline-none transition-colors leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Descripción del Alcance & Solución Propuesta <span className="text-[#e2445c]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe el objetivo funcional y el resultado esperado que debe entregar la solución tecnológica..."
                      className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-[#0073ea] focus:outline-none transition-colors leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Estimación de Beneficio & Eficiencia Operativa (Horas de Ahorro / Reducción de Reprocesos)
                    </label>
                    <input
                      type="text"
                      value={estimatedImpact}
                      onChange={e => setEstimatedImpact(e.target.value)}
                      placeholder="Ej. Ahorro estimado de 30 horas-hombre al mes y reducción de errores en facturación"
                      className="w-full bg-[#f8f9fc] border border-[#d0d7e5] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-[#0073ea] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* BLOQUE 4: ARCHIVOS ADJUNTOS DE MUESTRA & CONFIRMACIÓN */}
                <div className="bg-white border border-[#d0d7e5] rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 border-b border-[#f0f3f8] pb-3">
                    <div className="p-1.5 rounded-lg bg-[#0073ea]/10 text-[#0073ea]">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">4. Documentación de Respaldo & Insumos de Muestra</h3>
                      <p className="text-[11px] text-slate-500">Adjunta reportes de Excel de muestra, diagramas, capturas de pantalla o especificaciones</p>
                    </div>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-[#0073ea] rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-[#0073ea]/5 transition-all cursor-pointer"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.png,.jpg,.jpeg,.json,.xml"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-800">
                      {isUploading ? 'Cargando archivos al servidor...' : 'Arrastra y suelta tus archivos aquí o haz clic para examinar'}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Formatos compatibles: Excel (.xlsx, .csv), PDF, Capturas (.png, .jpg), Word (.docx)
                    </p>
                  </div>

                  {/* Lista de Archivos Adjuntados */}
                  {attachments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-slate-700">Archivos adjuntados ({attachments.length}):</div>
                      {attachments.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            {getFileIcon(file.name)}
                            <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                            <span className="text-[10px] text-slate-400">({formatFileSize(file.sizeBytes)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(file.id)}
                            className="text-slate-400 hover:text-[#e2445c] p-1 cursor-pointer"
                            title="Eliminar archivo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 bg-[#0073ea] hover:bg-[#0060c0] text-white text-xs font-bold px-8 py-3 rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting ? 'Registrando en TI...' : 'Registrar Requerimiento Formal'}</span>
                    </button>
                  </div>

                </div>

              </form>
            )}

          </div>
        )}

        {/* PESTAÑA 2: MIS SOLICITUDES ENVIADAS */}
        {activeTab === 'MY_REQUESTS' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#d0d7e5] rounded-2xl p-5 shadow-2xs">
              <h3 className="font-bold text-sm text-slate-900 mb-1">Mis Requerimientos Registrados</h3>
              <p className="text-xs text-slate-500">
                Consulta en tiempo real el estado y avance de atención por parte del equipo de TI
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-400">Cargando expedientes...</div>
            ) : requests.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                Aún no tienes requerimientos registrados en la plataforma.
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map(req => (
                  <div
                    key={req.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#0073ea] bg-[#0073ea]/10 px-2 py-0.5 rounded">
                          {req.code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{req.title}</h4>
                      </div>
                      {getStatusBadge(req.status)}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {req.businessPain}
                    </p>

                    {req.targetSystems && req.targetSystems.length > 0 && (
                      <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                        <span className="text-[10px] text-slate-400">Sistemas:</span>
                        {req.targetSystems.map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                      <span>Registrado el: {req.createdAt?.split('T')[0]}</span>
                      <span>{req.attachments?.length || 0} archivo(s) de respaldo adjunto(s)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
