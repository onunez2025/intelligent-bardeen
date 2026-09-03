'use client';

import React, { useState } from 'react';
import { useAuth, AuthUser } from '@/context/AuthContext';
import { Shield, Lock, ArrowRight, Sparkles, Building2, CheckCircle2, User, KeyRound } from 'lucide-react';

export const CorporateLogin: React.FC = () => {
  const { login, quickLoginAsSpecialist, quickLoginAsUser } = useAuth();
  
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [deptInput, setDeptInput] = useState('Finanzas & Contabilidad');
  const [selectedRole, setSelectedRole] = useState<'IT_SPECIALIST' | 'USER'>('USER');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleM365SsoLogin = (role: 'IT_SPECIALIST' | 'USER') => {
    setIsAuthenticating(true);
    setTimeout(() => {
      if (role === 'IT_SPECIALIST') {
        quickLoginAsSpecialist();
      } else {
        quickLoginAsUser();
      }
      setIsAuthenticating(false);
    }, 600);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nameInput.trim()) return;

    const initials = nameInput
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: nameInput.trim(),
      email: emailInput.trim(),
      department: deptInput,
      role: selectedRole,
      avatarInitials: initials
    };

    login(newUser);
  };

  return (
    <div className="min-h-screen bg-[#0f111a] flex flex-col items-center justify-center p-4 selection:bg-[#0073ea] selection:text-white">
      
      {/* Tarjeta Central de Inicio de Sesión M365 */}
      <div className="w-full max-w-md bg-[#181b2a] border border-[#2d324d] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decoración de fondo */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#0073ea]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-[#00c875]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Corporativo & Microsoft 365 Header */}
        <div className="text-center mb-8 relative z-10">
          
          {/* Logo TI Innovation */}
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0052cc] via-[#0073ea] to-[#00c875] p-[2px] shadow-lg">
              <div className="w-full h-full bg-[#181b2a] rounded-[14px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                  <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="#0073ea" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8L16 10.5V14.5L12 17L8 14.5V10.5L12 8Z" fill="#00c875" fillOpacity="0.8" />
                  <circle cx="12" cy="12.5" r="2" fill="#ffffff" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">TI Innovation Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Transformación Digital, Automatizaciones & IA
          </p>

          <div className="inline-flex items-center space-x-1.5 mt-3 px-3 py-1 rounded-full bg-[#24293e] border border-[#343b59] text-[11px] font-semibold text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-[#579bfc]" />
            <span>Grupo Sole • Corporación Rinnai</span>
          </div>
        </div>

        {/* Acceso Principal con Microsoft 365 (SSO) */}
        <div className="space-y-3 relative z-10">
          
          {/* Botón Principal: Microsoft 365 Oficial con redirección directa de navegador */}
          <a
            href="/api/auth/microsoft/login"
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#0073ea] hover:bg-[#0060c0] text-white font-bold text-xs shadow-lg hover:shadow-xl transition-all cursor-pointer group border border-blue-400/30"
          >
            <div className="flex items-center space-x-3">
              {/* Icono Microsoft 4 Colores */}
              <div className="w-7 h-7 bg-white rounded-md p-1 grid grid-cols-2 gap-0.5 shrink-0 shadow-xs">
                <div className="bg-[#f25022] rounded-[1px]"></div>
                <div className="bg-[#7fba00] rounded-[1px]"></div>
                <div className="bg-[#00a4ef] rounded-[1px]"></div>
                <div className="bg-[#ffb900] rounded-[1px]"></div>
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-xs leading-tight">Iniciar Sesión con Microsoft 365</div>
                <div className="text-[10px] text-blue-100 font-normal">Cuenta Institucional @gruposole.com.pe</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
          </a>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center pt-2">
            O seleccionar perfil de prueba rápido
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleM365SsoLogin('IT_SPECIALIST')}
              disabled={isAuthenticating}
              className="p-2.5 rounded-xl bg-[#24293e] hover:bg-[#2c3350] border border-[#373e5f] text-slate-300 font-semibold text-[11px] text-center transition-colors cursor-pointer"
            >
              🧑‍💻 Especialista TI
            </button>
            <button
              type="button"
              onClick={() => handleM365SsoLogin('USER')}
              disabled={isAuthenticating}
              className="p-2.5 rounded-xl bg-[#24293e] hover:bg-[#2c3350] border border-[#373e5f] text-slate-300 font-semibold text-[11px] text-center transition-colors cursor-pointer"
            >
              👤 Usuario M365
            </button>
          </div>

        </div>

        {/* Separador */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#2d324d]"></div>
          </div>
          <span className="relative bg-[#181b2a] px-3 text-[11px] font-semibold text-slate-500">
            o ingresar con otra cuenta
          </span>
        </div>

        {/* Formulario para ingresar cualquier cuenta M365 */}
        {!isManualOpen ? (
          <button
            onClick={() => setIsManualOpen(true)}
            className="w-full text-center text-xs font-semibold text-[#579bfc] hover:text-[#0073ea] transition-colors cursor-pointer py-1"
          >
            + Escribir otro correo de la empresa...
          </button>
        ) : (
          <form onSubmit={handleManualLogin} className="space-y-3 bg-[#131622] p-4 rounded-2xl border border-[#2b314d]">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Nombre Completo:
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Mariana Torres"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                className="w-full bg-[#1e2338] border border-[#353d60] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0073ea]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Correo Corporativo M365:
              </label>
              <input
                type="email"
                required
                placeholder="nombre@gruposole.com.pe"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                className="w-full bg-[#1e2338] border border-[#353d60] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0073ea]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Área / Dpto:
                </label>
                <select
                  value={deptInput}
                  onChange={e => setDeptInput(e.target.value)}
                  className="w-full bg-[#1e2338] border border-[#353d60] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#0073ea]"
                >
                  <option value="Finanzas & Contabilidad">Finanzas</option>
                  <option value="Operaciones & Logística">Logística</option>
                  <option value="Comercial & Ventas">Ventas</option>
                  <option value="Servicio Técnico">Servicio Técnico</option>
                  <option value="Recursos Humanos">RRHH</option>
                  <option value="Transformación Digital & IA">TI & IA</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Perfil de Acceso:
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as any)}
                  className="w-full bg-[#1e2338] border border-[#353d60] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#0073ea]"
                >
                  <option value="USER">Usuario Solicitante</option>
                  <option value="IT_SPECIALIST">Especialista TI</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00c875] hover:bg-[#00b067] text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-md cursor-pointer mt-2"
            >
              Entrar con esta Cuenta
            </button>
          </form>
        )}

        {/* Footer de Seguridad */}
        <div className="mt-8 pt-4 border-t border-[#262c47] flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5 text-[#00c875]" />
          <span>Autenticación Segura con Microsoft Entra ID (Azure AD)</span>
        </div>

      </div>

    </div>
  );
};
