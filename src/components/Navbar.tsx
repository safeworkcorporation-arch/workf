import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Send,
  PenTool,
  History,
  Settings,
  Plus,
  Eye,
  Edit3,
  Loader2,
  Wrench,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
  Upload,
  Laptop,
  LogOut,
  Shield,
} from 'lucide-react';
import { SafeWorkLogo } from './SafeWorkLogo';

interface NavbarProps {
  activeModule: 'services' | 'proformas';
  onSelectModule: (module: 'services' | 'proformas') => void;
  activeTab: 'editor' | 'preview';
  setActiveTab: (tab: 'editor' | 'preview') => void;
  documentNumber: string;
  onOpenSignatureModal: (type: 'client' | 'technician') => void;
  onOpenEmailModal: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenSettingsTab?: (tab: 'logo' | 'payment' | 'company' | 'smtp' | 'guides') => void;
  onCreateNew: () => void;
  onCreateProformaFromReport?: () => void;
  onDownloadPdf: () => void;
  onPrint: () => void;
  isGeneratingPdf: boolean;
  historyCount: number;
  proformasCount: number;
  companyLogoUrl?: string;
  onUploadLogo?: (fileDataUrl: string) => void;
  currentUser?: string;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeModule,
  onSelectModule,
  activeTab,
  setActiveTab,
  documentNumber,
  onOpenSignatureModal,
  onOpenEmailModal,
  onOpenHistory,
  onOpenSettings,
  onOpenSettingsTab,
  onCreateNew,
  onCreateProformaFromReport,
  onDownloadPdf,
  onPrint,
  isGeneratingPdf,
  historyCount,
  proformasCount,
  companyLogoUrl,
  onUploadLogo,
  currentUser = 'adminwork',
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadLogo) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida (PNG, JPG, SVG).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onUploadLogo(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isCustomLogo =
    Boolean(companyLogoUrl) &&
    companyLogoUrl !== '/safework-logo.png' &&
    (companyLogoUrl!.startsWith('data:') || companyLogoUrl!.startsWith('http'));

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* TOP LEVEL NAVIGATION BAR */}
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Document Number Badge */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            {/* Interactive Logo Area with PC Upload */}
            <div className="relative group flex items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onClick={() => {
                  if (onOpenSettingsTab) {
                    onOpenSettingsTab('logo');
                  } else {
                    onOpenSettings();
                  }
                }}
                className="cursor-pointer flex items-center gap-2 p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
                title="Haz clic para abrir el menú o cambiar el logo desde tu PC"
              >
                {isCustomLogo ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={companyLogoUrl}
                      alt="Logo Empresa"
                      className="h-9 max-w-[130px] sm:max-w-[170px] object-contain drop-shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <SafeWorkLogo size="sm" layout="horizontal" inverted={true} />
                )}
              </div>

              {/* Quick direct PC upload action button on hover */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                title="Subir logo directamente desde mi PC"
                className="hidden group-hover:flex items-center gap-1 absolute -bottom-5 left-0 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white text-[9.5px] font-bold rounded shadow-md z-50 whitespace-nowrap animate-fade-in"
              >
                <Laptop className="w-2.5 h-2.5" />
                <span>Subir de PC</span>
              </button>
            </div>

            <div className="hidden lg:flex flex-col">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                  activeModule === 'proformas'
                    ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                    : 'bg-cyan-950 text-cyan-300 border-cyan-800/50'
                }`}
              >
                {documentNumber}
              </span>
            </div>
          </div>

          {/* MAIN MODULE SELECTOR (Hojas de Servicio vs Proformas) */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => onSelectModule('services')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeModule === 'services'
                  ? 'bg-slate-800 text-cyan-300 shadow-xs border border-slate-700/80'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Hojas de Servicio</span>
              <span className="sm:hidden">Servicios</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-900/60 text-cyan-200 border border-cyan-700/40">
                {historyCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSelectModule('proformas')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                activeModule === 'proformas'
                  ? 'bg-blue-600 text-white shadow-xs border border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-amber-300" />
              <span>Proformas</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-blue-900/80 text-blue-200 border border-blue-700/60">
                {proformasCount}
              </span>
            </button>
          </div>

          {/* DOCUMENT MODE SWITCHER (Formulario vs Vista Oficial) */}
          <div className="hidden md:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Vista Oficial</span>
            </button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick action: Generate proforma from service sheet */}
            {activeModule === 'services' && onCreateProformaFromReport && (
              <button
                type="button"
                onClick={onCreateProformaFromReport}
                title="Generar Proforma / Cotización para este equipo y cliente"
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/60 rounded-lg transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                <span>Crear Proforma</span>
              </button>
            )}

            {/* Quick Signature trigger */}
            <div className="relative group hidden sm:block">
              <button
                type="button"
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                <span>Firmar</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 w-48 z-50">
                <button
                  type="button"
                  onClick={() => onOpenSignatureModal('technician')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
                >
                  <PenTool className="w-3.5 h-3.5 text-indigo-400" />
                  {activeModule === 'proformas' ? 'Firma Safe Work' : 'Firma de Técnico'}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenSignatureModal('client')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
                >
                  <PenTool className="w-3.5 h-3.5 text-blue-400" />
                  {activeModule === 'proformas' ? 'Firma Aceptación Cliente' : 'Firma de Cliente'}
                </button>
              </div>
            </div>

            {/* Print button */}
            <button
              type="button"
              onClick={onPrint}
              title="Imprimir documento oficial"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download PDF button */}
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isGeneratingPdf}
              title="Descargar en PDF de alta resolución"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-slate-300" />
              )}
              <span className="hidden lg:inline">PDF</span>
            </button>

            {/* Main Email Send button */}
            <button
              type="button"
              onClick={onOpenEmailModal}
              title="Enviar por correo documentos, proformas y facturas desde tu PC"
              className="px-3 sm:px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enviar Correo / Facturas</span>
            </button>

            {/* History drawer trigger */}
            <button
              type="button"
              onClick={onOpenHistory}
              title={
                activeModule === 'proformas'
                  ? 'Historial de Proformas'
                  : 'Historial de Hojas de Servicio'
              }
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg relative transition-colors"
            >
              <History className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 text-[9px] font-bold text-white flex items-center justify-center">
                {activeModule === 'proformas' ? proformasCount : historyCount}
              </span>
            </button>

            {/* Settings Menu trigger */}
            <button
              type="button"
              onClick={onOpenSettings}
              title="Menú de Configuración: Logo desde PC, Forma de Pago (Totalidad), Empresa y Correo"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 shadow-xs transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xl:inline">Configuración</span>
            </button>

            {/* New Document Button */}
            <button
              type="button"
              onClick={onCreateNew}
              title={
                activeModule === 'proformas'
                  ? 'Crear nueva proforma en blanco'
                  : 'Crear nueva hoja de servicio'
              }
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all transform active:scale-95 ${
                activeModule === 'proformas'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {activeModule === 'proformas' ? 'Nueva Proforma' : 'Nuevo'}
              </span>
            </button>

            {/* Admin Profile & Logout */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-slate-800 gap-1.5">
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] font-medium text-slate-300"
                title="Sesión de Administrador activa"
              >
                <Shield className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-200 font-semibold">Admin</span>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Cerrar sesión de administrador"
                  className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-950/50 border border-transparent hover:border-red-900/60 transition-colors flex items-center gap-1 text-xs font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden xl:inline">Salir</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE SUB-BAR FOR EDITOR / PREVIEW TOGGLE */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800 text-xs">
          <span className="font-mono text-[11px] font-bold text-slate-400">
            {documentNumber}
          </span>

          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300'
              }`}
            >
              Vista Oficial
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
