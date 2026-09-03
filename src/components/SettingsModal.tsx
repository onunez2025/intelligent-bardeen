'use client';

import React, { useState } from 'react';
import { X, Database, Bot, CheckCircle2, Copy, Server, DollarSign, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [hourlyRate, setHourlyRate] = useState(18);

  const sampleEnv = `# Configuración SQL Server
DATABASE_URL="sqlserver://tu-servidor:1433;database=ProyectosTI;user=tu_usuario;password=tu_contraseña;encrypt=true;trustServerCertificate=true"

# DeepSeek AI API Key
DEEPSEEK_API_KEY="sk-tu-api-key-de-deepseek"
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"

# Microsoft 365 (Entra ID / Azure AD)
AZURE_AD_CLIENT_ID="tu-client-id"
AZURE_AD_CLIENT_SECRET="tu-client-secret"
AZURE_AD_TENANT_ID="tu-tenant-id"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[#d0d7e5] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-[#f8f9fc] px-6 py-4 border-b border-[#e6ebf5] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#0073ea]/10 text-[#0073ea]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#323338]">Configuración del Sistema, SQL Server & ROI</h2>
              <p className="text-xs text-[#676879]">Parámetros financieros de ahorro y conectores de base de datos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#676879] hover:text-[#323338] hover:bg-[#e6ebf5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Configuración Financiera de ROI */}
          <div className="bg-[#f8f9fc] border border-[#d0d7e5] rounded-2xl p-4 space-y-3">
            <div className="font-bold text-[#323338] text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4 text-[#00c875]" />
              <span>Parámetros Financieros para Cálculo de Ahorro (ROI)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#676879] font-bold mb-1">Moneda del Sistema</label>
                <select
                  value={currencyCode}
                  onChange={e => {
                    const code = e.target.value;
                    setCurrencyCode(code);
                    if (code === 'USD') setCurrencySymbol('$');
                    else if (code === 'PEN') setCurrencySymbol('S/.');
                    else if (code === 'MXN') setCurrencySymbol('MXN$');
                    else if (code === 'EUR') setCurrencySymbol('€');
                  }}
                  className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2 text-[#323338] font-bold text-xs"
                >
                  <option value="USD">Dólares Americanos (USD $)</option>
                  <option value="PEN">Soles Peruanos (PEN S/.)</option>
                  <option value="MXN">Pesos Mexicanos (MXN $)</option>
                  <option value="EUR">Euros (EUR €)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#676879] font-bold mb-1">Costo Hora Promedio por Puesto ({currencySymbol})</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-white border border-[#d0d7e5] rounded-xl p-2 text-[#00854d] font-bold text-xs"
                />
              </div>
            </div>

            <p className="text-[11px] text-[#676879] leading-relaxed">
              Fórmula de ROI: <strong className="text-[#323338]">Ahorro Mensual ({currencySymbol}) = Horas Ahorradas al Mes × {currencySymbol}{hourlyRate}/hr</strong>.
            </p>
          </div>

          {/* SQL Server */}
          <div className="bg-[#f8f9fc] border border-[#e6ebf5] rounded-2xl p-4 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#0073ea]/15 text-[#0073ea] shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-[#323338] text-sm">Microsoft SQL Server</h4>
                <span className="px-2 py-0.5 rounded-full bg-[#00c875]/15 text-[#00854d] font-bold text-[10px]">
                  Prisma Listo
                </span>
              </div>
              <p className="text-[#676879] text-xs mt-1 leading-relaxed">
                El esquema de base de datos está listo para SQL Server. Al ingresar la cadena de conexión en `.env.local`, se sincronizarán todos los proyectos.
              </p>
            </div>
          </div>

          {/* DeepSeek */}
          <div className="bg-[#f8f9fc] border border-[#e6ebf5] rounded-2xl p-4 flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#a25ddc]/15 text-[#784bd1] shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-[#323338] text-sm">DeepSeek AI</h4>
                <span className="px-2 py-0.5 rounded-full bg-[#a25ddc]/15 text-[#784bd1] font-bold text-[10px]">
                  Conector Activo
                </span>
              </div>
              <p className="text-[#676879] text-xs mt-1 leading-relaxed">
                Audita el avance de código de los repositorios y analiza los requerimientos de los usuarios automáticamente.
              </p>
            </div>
          </div>

          {/* Variables de entorno */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#323338]">Archivo `.env.local`:</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 text-[#0073ea] hover:text-[#0060c0] font-bold text-xs cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00c875]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Variables'}</span>
              </button>
            </div>

            <pre className="bg-[#1f2336] text-white rounded-2xl p-4 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {sampleEnv}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fc] px-6 py-3.5 border-t border-[#e6ebf5] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Guardar & Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
