import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Check,
  Building2,
  Phone,
  Mail,
  ShieldCheck,
  Server,
  Key,
  Info,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Upload,
  RotateCcw,
  Image as ImageIcon,
  CreditCard,
  Clock,
  Calendar,
  FileText,
  FileCheck2,
  DollarSign,
  Laptop,
  BookOpen,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { CompanySettings } from '../types';
import { SafeWorkLogo } from './SafeWorkLogo';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings, applyToCurrentProforma?: boolean) => void;
  initialTab?: 'logo' | 'payment' | 'company' | 'smtp' | 'guides';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  initialTab = 'logo',
}) => {
  const [activeTab, setActiveTab] = useState<'logo' | 'payment' | 'company' | 'smtp' | 'guides'>(
    initialTab
  );

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [formData, setFormData] = useState<CompanySettings>({
    ...settings,
    defaultPaymentMethod:
      settings.defaultPaymentMethod || 'En su totalidad (100% al momento de la entrega / orden)',
    defaultDeliveryTime: settings.defaultDeliveryTime || 'Inmediata / En sitio tras confirmación',
    defaultValidityDays: settings.defaultValidityDays || 30,
    defaultDocumentTitle: settings.defaultDocumentTitle || 'Factura',
    defaultBankingDetails:
      settings.defaultBankingDetails ||
      'Banco Pichincha | Cta. Corriente | Safe Work Corporation | R.U.C. 1308013182001',
    defaultNotes:
      settings.defaultNotes ||
      's.w.corporation, sitio los Angeles s/n, 130112 PORTOVIEJO, Ecuador',
  });

  const [applyToCurrentProforma, setApplyToCurrentProforma] = useState(true);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadSuccessFeedback, setUploadSuccessFeedback] = useState(false);

  // SMTP state
  const [activeProvider, setActiveProvider] = useState<'gmail' | 'outlook' | 'yahoo' | 'custom'>(
    formData.smtpConfig?.provider ||
      (formData.smtpConfig?.host?.includes('gmail')
        ? 'gmail'
        : formData.smtpConfig?.host?.includes('outlook') || formData.smtpConfig?.host?.includes('office365')
        ? 'outlook'
        : formData.smtpConfig?.host?.includes('yahoo')
        ? 'yahoo'
        : 'gmail')
  );
  const [showGmailGuide, setShowGmailGuide] = useState(false);
  const [showHotmailGuide, setShowHotmailGuide] = useState(true);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormData((prev) => ({
          ...prev,
          logoUrl: event.target?.result as string,
        }));
        setUploadSuccessFeedback(true);
        setTimeout(() => setUploadSuccessFeedback(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectProvider = (provider: 'gmail' | 'outlook' | 'yahoo' | 'custom') => {
    setActiveProvider(provider);
    setSmtpTestResult(null);

    const currentUser = formData.smtpConfig?.user || formData.technicianEmail || '';

    if (provider === 'gmail') {
      setFormData({
        ...formData,
        smtpConfig: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          user: currentUser.includes('@gmail.com') ? currentUser : '',
          pass: formData.smtpConfig?.pass || '',
          provider: 'gmail',
        },
      });
      setShowGmailGuide(true);
      setShowHotmailGuide(false);
    } else if (provider === 'outlook') {
      setFormData({
        ...formData,
        smtpConfig: {
          host: 'smtp-mail.outlook.com',
          port: 587,
          secure: false,
          user: currentUser.includes('@hotmail') || currentUser.includes('@outlook') ? currentUser : '',
          pass: formData.smtpConfig?.pass || '',
          provider: 'outlook',
        },
      });
      setShowGmailGuide(false);
      setShowHotmailGuide(true);
    } else if (provider === 'yahoo') {
      setFormData({
        ...formData,
        smtpConfig: {
          host: 'smtp.mail.yahoo.com',
          port: 465,
          secure: true,
          user: currentUser.includes('@yahoo') ? currentUser : '',
          pass: formData.smtpConfig?.pass || '',
          provider: 'yahoo',
        },
      });
      setShowGmailGuide(false);
    } else {
      setFormData({
        ...formData,
        smtpConfig: {
          host: formData.smtpConfig?.host || '',
          port: formData.smtpConfig?.port || 587,
          secure: formData.smtpConfig?.secure || false,
          user: formData.smtpConfig?.user || currentUser,
          pass: formData.smtpConfig?.pass || '',
          provider: 'custom',
        },
      });
      setShowGmailGuide(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!formData.smtpConfig?.user || !formData.smtpConfig?.pass) {
      setSmtpTestResult({
        success: false,
        message: 'Debes completar el correo de usuario y la contraseña (o clave de aplicación).',
      });
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpConfig: formData.smtpConfig,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al validar la conexión SMTP.');
      }

      setSmtpTestResult({
        success: true,
        message: data.message || '¡Conexión verificada exitosamente!',
      });
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.message || 'Error desconocido al probar la conexión SMTP.',
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData, applyToCurrentProforma);
    onClose();
  };

  const isCustomLogo =
    Boolean(formData.logoUrl) &&
    formData.logoUrl !== '/safework-logo.png' &&
    (formData.logoUrl!.startsWith('data:') || formData.logoUrl!.startsWith('http'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <Settings className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-wide">
                Menú de Configuración General
              </h3>
              <p className="text-[11px] text-slate-400">
                Personaliza Logo desde PC, Forma de Pago (Totalidad), Empresa y Correo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 pt-2 flex items-center gap-1 overflow-x-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === 'logo'
                ? 'bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>1. Logo desde PC</span>
            {isCustomLogo && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Logo personalizado activo" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === 'payment'
                ? 'bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-500" />
            <span>2. Forma de Pago y Proforma</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-800 font-black">
              100%
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('company')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === 'company'
                ? 'bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-600" />
            <span>3. Datos de Empresa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('smtp')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === 'smtp'
                ? 'bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-indigo-500" />
            <span>4. Servidor SMTP</span>
            {formData.smtpConfig?.user && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guides')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-1.5 border-t border-x ${
              activeTab === 'guides'
                ? 'bg-white text-emerald-600 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-200/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>5. Guías (Hotmail y Dominio)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-bold">
              Ayuda
            </span>
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: LOGO DESDE PC */}
          {activeTab === 'logo' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  Subir Logotipo Oficial desde tu Computadora (PC)
                </h4>
                <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                  Carga la imagen de tu empresa desde tu ordenador. Esta imagen se aplicará de forma automática en la{' '}
                  <strong>barra de navegación superior</strong>, en la <strong>Proforma / Factura oficial</strong>, en la{' '}
                  <strong>Hoja de Servicio</strong> y en los <strong>archivos PDF</strong> descargados.
                </p>
              </div>

              {/* DRAG AND DROP / UPLOAD BOX */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDraggingFile
                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]'
                    : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50 hover:border-blue-400'
                }`}
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-xs">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>

                <h5 className="text-xs sm:text-sm font-bold text-slate-800">
                  Arrastra tu logo aquí o selecciona desde tu PC
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 mb-4">
                  Formatos compatibles: <strong>PNG</strong> (con fondo transparente recomendado),{' '}
                  <strong>JPG</strong>, <strong>SVG</strong> o <strong>WEBP</strong>.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <label className="cursor-pointer px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform active:scale-95">
                    <Laptop className="w-4 h-4" />
                    <span>Seleccionar Archivo de mi PC</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>

                  {isCustomLogo && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: '/safework-logo.png' })}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
                      title="Restablecer el logotipo vectorial original de Safe Work Corporation"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Restablecer Logo Safe Work</span>
                    </button>
                  )}
                </div>

                {uploadSuccessFeedback && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Logo cargado exitosamente desde tu PC!</span>
                  </div>
                )}
              </div>

              {/* LIVE PREVIEW BOXES */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Vista Previa en Tiempo Real:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PREVIEW ON WHITE (PROFORMA & PDF) */}
                  <div className="p-4 bg-white border border-slate-200 rounded-xl text-center shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">
                      En Documento / Proforma / Hoja Técnica (Fondo Blanco)
                    </span>
                    <div className="h-20 flex items-center justify-center p-2 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      {isCustomLogo ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo de Empresa"
                          className="max-h-16 max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <SafeWorkLogo size="md" layout="horizontal" />
                      )}
                    </div>
                  </div>

                  {/* PREVIEW ON DARK (HEADER NAVBAR) */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center text-white shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-3">
                      En Barra Superior (Navbar Fondo Oscuro)
                    </span>
                    <div className="h-20 flex items-center justify-center p-2 bg-slate-800/80 rounded-lg border border-dashed border-slate-700">
                      {isCustomLogo ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo de Empresa en Navbar"
                          className="max-h-14 max-w-full object-contain drop-shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <SafeWorkLogo size="sm" layout="horizontal" inverted={true} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                  <span>
                    Estado actual:{' '}
                    <strong>{isCustomLogo ? 'Logotipo propio subido desde PC' : 'Logotipo oficial Safe Work Corporation'}</strong>
                  </span>
                  {isCustomLogo && (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Activo
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMA DE PAGO Y PROFORMA */}
          {activeTab === 'payment' && (
            <div className="space-y-4">
              {/* HIGHLIGHT BANNER: PAGO EN SU TOTALIDAD */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4 font-black" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                      Forma de Pago Requerida: En su Totalidad (100%)
                    </h4>
                    <p className="text-[11.5px] text-amber-900 mt-0.5 leading-relaxed">
                      Conforme a tu solicitud, el formato de pago está configurado para liquidarse{' '}
                      <strong>en su totalidad al 100%</strong> (sin pagos divididos o parciales). Puedes personalizar el texto exacto o usar los botones de acceso rápido abajo.
                    </p>
                  </div>
                </div>
              </div>

              {/* FORMA DE PAGO INPUT & CHIPS */}
              <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  Texto de Forma de Pago Oficial (Aparece en Proforma / Factura)
                </label>

                <input
                  type="text"
                  required
                  value={formData.defaultPaymentMethod || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultPaymentMethod: e.target.value })
                  }
                  placeholder="En su totalidad (100% contra entrega / transferencia bancaria)"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 bg-blue-50/20"
                />

                {/* QUICK 1-CLICK PRESETS */}
                <div>
                  <span className="text-[10.5px] font-bold text-slate-500 uppercase block mb-1.5">
                    Opciones de Forma de Pago en su Totalidad (1 Clic para seleccionar):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'En su totalidad (100% al momento de la entrega / orden)',
                      'En su totalidad (100% contra entrega)',
                      'En su totalidad (100% anticipado)',
                      'En su totalidad mediante transferencia bancaria',
                      'En su totalidad al recibir el equipo a entera satisfacción',
                      'Pago 100% en su totalidad contra presentación de factura',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, defaultPaymentMethod: preset })
                        }
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all text-left ${
                          formData.defaultPaymentMethod === preset
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                        }`}
                      >
                        ✓ {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHECKBOX: APPLY TO CURRENT PROFORMA */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={applyToCurrentProforma}
                      onChange={(e) => setApplyToCurrentProforma(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>
                      Aplicar inmediatamente esta forma de pago a la <strong>Proforma / Factura actual abierta</strong>
                    </span>
                  </label>
                </div>
              </div>

              {/* OTHER PROFORMA DEFAULTS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Tiempo de Entrega Predeterminado
                  </label>
                  <input
                    type="text"
                    value={formData.defaultDeliveryTime || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultDeliveryTime: e.target.value })
                    }
                    placeholder="Inmediata / En sitio tras confirmación"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Inmediata / En sitio', '24 a 48 horas', '3 a 5 días laborables'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({ ...formData, defaultDeliveryTime: t })}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    Título Oficial del Documento
                  </label>
                  <select
                    value={formData.defaultDocumentTitle || 'Factura'}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultDocumentTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold bg-white"
                  >
                    <option value="Factura">Factura</option>
                    <option value="Proforma">Proforma</option>
                    <option value="Cotización">Cotización</option>
                  </select>
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    Se muestra en el título principal en la esquina superior izquierda.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    Cuentas Bancarias Predeterminadas (Para pago en su totalidad)
                  </label>
                  <input
                    type="text"
                    value={formData.defaultBankingDetails || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultBankingDetails: e.target.value })
                    }
                    placeholder="Banco Pichincha | Cta. Corriente | Safe Work Corporation | R.U.C. 1308013182001"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dirección y Ubicación Oficial de Encabezado
                  </label>
                  <input
                    type="text"
                    value={formData.defaultNotes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultNotes: e.target.value })
                    }
                    placeholder="s.w.corporation, sitio los Angeles s/n, 130112 PORTOVIEJO, Ecuador"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Texto que figura bajo el título de Factura / Proforma en el membrete oficial.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATOS DE EMPRESA Y TÉCNICO */}
          {activeTab === 'company' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nombre Oficial de la Empresa
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="s.w.corporation"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Subtítulo Oficial (Para Hojas de Servicio)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nombre del Ingeniero / Técnico Responsable
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.technicianName}
                    onChange={(e) =>
                      setFormData({ ...formData, technicianName: e.target.value })
                    }
                    placeholder="ING. Eduardo Marin"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Aparece con el icono de usuario en el pie de página de la proforma.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Teléfono Oficial de Contacto
                  </label>
                  <input
                    type="text"
                    value={formData.technicianPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, technicianPhone: e.target.value })
                    }
                    placeholder="0991182698"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Correo Oficial de la Empresa
                  </label>
                  <input
                    type="email"
                    value={formData.technicianEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, technicianEmail: e.target.value })
                    }
                    placeholder="s.w.service0012@hotmail.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    R.U.C. / Business ID
                  </label>
                  <input
                    type="text"
                    value={formData.ruc}
                    onChange={(e) =>
                      setFormData({ ...formData, ruc: e.target.value })
                    }
                    placeholder="1308013182001"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Dirección Física Completa (Pie de página)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="s.w.corporation, sitio los Angeles s/n, 130112 PORTOVIEJO, Ecuador"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Correos para Copia Automática (CC por defecto)
                  </label>
                  <input
                    type="text"
                    value={formData.defaultEmailCC}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultEmailCC: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-slate-700"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Separa múltiples correos con comas. Se agregarán automáticamente al enviar por email.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVIDOR SMTP */}
          {activeTab === 'smtp' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-blue-600" />
                    Conexión de Correo Saliente (Para enviar PDFs a clientes reales)
                  </span>
                  {formData.smtpConfig?.user ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Configurado
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Modo Simulador
                    </span>
                  )}
                </div>

                {/* Provider Selector Buttons */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                    Selecciona tu proveedor de correo:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectProvider('gmail')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        activeProvider === 'gmail'
                          ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Gmail (Google)
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectProvider('outlook')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        activeProvider === 'outlook'
                          ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-400'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Outlook / Hotmail
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectProvider('yahoo')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        activeProvider === 'yahoo'
                          ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-400'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Yahoo Mail
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectProvider('custom')}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        activeProvider === 'custom'
                          ? 'bg-slate-800 text-white border-slate-900 ring-2 ring-slate-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Server className="w-3.5 h-3.5" />
                      Personalizado
                    </button>
                  </div>
                </div>

                {/* Instructions for Gmail App Password */}
                {activeProvider === 'gmail' && (
                  <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg text-xs text-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-900 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-red-600" />
                        Requisito de Google: Contraseña de Aplicación (16 letras)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowGmailGuide(!showGmailGuide)}
                        className="text-[11px] text-red-700 hover:underline font-semibold"
                      >
                        {showGmailGuide ? 'Ocultar pasos' : 'Ver cómo generarla'}
                      </button>
                    </div>
                    {showGmailGuide && (
                      <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-700 leading-normal mt-1 border-t border-red-200 pt-2">
                        <li>
                          Abre tu cuenta de Google en{' '}
                          <a
                            href="https://myaccount.google.com/security"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline font-semibold inline-flex items-center gap-0.5"
                          >
                            myaccount.google.com/security <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </li>
                        <li>En la sección <strong>Seguridad</strong>, activa la <strong>Verificación en 2 pasos</strong>.</li>
                        <li>
                          Busca en la barra superior:{' '}
                          <a
                            href="https://myaccount.google.com/apppasswords"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 underline font-semibold inline-flex items-center gap-0.5"
                          >
                            Contraseñas de aplicaciones <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </li>
                        <li>Escribe un nombre (ej. <em>SafeWork</em>) y haz clic en <strong>Crear</strong>.</li>
                        <li>Copia el código amarillo de <strong>16 letras</strong> y pégalo abajo en Contraseña.</li>
                      </ol>
                    )}
                  </div>
                )}

                {/* Instructions for Hotmail / Outlook */}
                {activeProvider === 'outlook' && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-blue-600" />
                        Guía para Hotmail / Outlook / Live
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowHotmailGuide(!showHotmailGuide)}
                        className="text-[11px] text-blue-700 hover:underline font-semibold"
                      >
                        {showHotmailGuide ? 'Ocultar pasos' : 'Ver cómo configurar'}
                      </button>
                    </div>
                    {showHotmailGuide && (
                      <div className="text-[11px] text-slate-700 leading-normal border-t border-blue-200 pt-2 space-y-1.5">
                        <p className="font-medium text-blue-950">
                          ¿Qué necesitas para enviar facturas y proformas con Hotmail?
                        </p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>
                            <strong>Tu correo:</strong> Escribe tu cuenta de Hotmail completa (ej: <code>usuario@hotmail.com</code>).
                          </li>
                          <li>
                            <strong>Servidor y Puerto:</strong> Automático en <code>smtp-mail.outlook.com</code> y puerto <code>587</code> (deja la casilla SSL <strong>desmarcada</strong>).
                          </li>
                          <li>
                            <strong>Contraseña:</strong> Tu contraseña de Hotmail. Si tienes verificación en 2 pasos activada en Microsoft, genera una <strong>Contraseña de aplicación</strong> en{' '}
                            <a
                              href="https://account.microsoft.com/security"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 underline font-semibold inline-flex items-center gap-0.5"
                            >
                              account.microsoft.com/security <ExternalLink className="w-2.5 h-2.5" />
                            </a>{' '}
                            (Opciones de seguridad avanzadas &gt; Contraseñas de aplicaciones).
                          </li>
                          <li>
                            Haz clic abajo en <strong>"Probar Conexión SMTP"</strong> para verificarlo de inmediato.
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {/* SMTP Input fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Servidor SMTP (Host)
                    </label>
                    <input
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={formData.smtpConfig?.host || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          smtpConfig: {
                            ...formData.smtpConfig,
                            host: e.target.value,
                            port: formData.smtpConfig?.port || 587,
                            secure: formData.smtpConfig?.secure || false,
                            user: formData.smtpConfig?.user || '',
                            pass: formData.smtpConfig?.pass || '',
                            provider: activeProvider,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Puerto (465 SSL o 587 TLS)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="465"
                        value={formData.smtpConfig?.port || 465}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            smtpConfig: {
                              ...formData.smtpConfig!,
                              port: Number(e.target.value),
                              secure: Number(e.target.value) === 465,
                            },
                          })
                        }
                        className="w-24 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                      />
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.smtpConfig?.secure ?? true}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              smtpConfig: {
                                ...formData.smtpConfig!,
                                secure: e.target.checked,
                              },
                            })
                          }
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        Conexión segura (SSL)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Tu Correo Saliente (Usuario) *
                    </label>
                    <input
                      type="email"
                      placeholder="tu_correo@gmail.com"
                      value={formData.smtpConfig?.user || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          smtpConfig: {
                            ...formData.smtpConfig!,
                            user: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      {activeProvider === 'gmail'
                        ? 'Contraseña de Aplicación (16 letras) *'
                        : 'Contraseña del Correo *'}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={formData.smtpConfig?.pass || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          smtpConfig: {
                            ...formData.smtpConfig!,
                            pass: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Live Test Feedback Banner */}
                {smtpTestResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      smtpTestResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    {smtpTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{smtpTestResult.message}</span>
                  </div>
                )}

                {/* Connection Test Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Comprueba que las credenciales funcionen antes de guardar.
                  </span>
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={isTestingSmtp}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    {isTestingSmtp ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        Verificando servidor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Probar Conexión SMTP
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GUÍAS OFICIALES (HOTMAIL Y DOMINIO) */}
          {activeTab === 'guides' && (
            <div className="space-y-6 animate-fade-in">
              {/* HEADER BANNER */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                    Centro de Guías Oficiales: Safe Work Corporation
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    Sigue estas instrucciones detalladas paso a paso para configurar tu correo <strong>Hotmail</strong> y para apuntar tu propio dominio web <strong>safeworkcorporationadmin.com</strong>.
                  </p>
                </div>
              </div>

              {/* GUÍA 1: HOTMAIL */}
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      Guía: Cómo Enviar Documentos y Facturas con tu Correo Hotmail
                    </h5>
                  </div>
                  <span className="text-[10px] bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full font-mono border border-blue-400/30">
                    Hotmail / Outlook
                  </span>
                </div>

                <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
                  {/* ¿QUÉ NECESITAS? */}
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                    <h6 className="font-bold text-blue-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      ¿Qué necesitas tener a mano?
                    </h6>
                    <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-blue-900">
                      <li>
                        Tu cuenta de correo activa (ej: <code>tu_correo@hotmail.com</code>, <code>@outlook.com</code> o <code>@live.com</code>).
                      </li>
                      <li>
                        Tu contraseña de Hotmail.
                      </li>
                      <li>
                        Tener activada la casilla de servidor SMTP seguro (el sistema lo hace automáticamente).
                      </li>
                    </ul>
                  </div>

                  {/* PASO A PASO */}
                  <div className="space-y-3">
                    <h6 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Paso a paso para configurarlo en el sistema:
                    </h6>

                    <ol className="list-decimal pl-5 space-y-2.5 text-[11.5px] text-slate-700">
                      <li>
                        <strong>Abre la pestaña de Servidor:</strong> En este mismo menú, ve a la pestaña <strong>"4. Servidor SMTP"</strong>.
                      </li>
                      <li>
                        <strong>Selecciona el proveedor:</strong> Haz clic en el botón azul <strong>"Outlook / Hotmail"</strong>.
                      </li>
                      <li>
                        <strong>Verifica los parámetros automáticos:</strong>
                        <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                          <div><span className="text-slate-500">Servidor (Host):</span> <strong>smtp-mail.outlook.com</strong></div>
                          <div><span className="text-slate-500">Puerto:</span> <strong>587</strong></div>
                          <div><span className="text-slate-500">Conexión SSL:</span> <strong>Desmarcada</strong> (usa TLS)</div>
                          <div><span className="text-slate-500">Seguridad:</span> <strong>STARTTLS</strong></div>
                        </div>
                      </li>
                      <li>
                        <strong>Ingresa tus credenciales:</strong>
                        <ul className="list-disc pl-4 mt-1 space-y-1">
                          <li>En <strong>"Tu Correo Saliente (Usuario)"</strong>: Escribe tu dirección de Hotmail completa.</li>
                          <li>En <strong>"Contraseña del Correo"</strong>: Ingresa tu clave.</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Verifica la conexión:</strong> Haz clic en el botón <strong>"Probar Conexión SMTP"</strong>. En 2 segundos verás un recuadro verde con la confirmación de entrega exitosa.
                      </li>
                      <li>
                        <strong>Guarda los cambios:</strong> Haz clic en el botón azul <strong>"Guardar Configuración"</strong>.
                      </li>
                    </ol>
                  </div>

                  {/* TROUBLESHOOTING MICROSOFT 2FA */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-[11px] text-amber-900">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>¿Qué hacer si te da "Error de autenticación (535)"?</span>
                    </div>
                    <p>
                      Si tu cuenta Microsoft tiene activada la <strong>Verificación en dos pasos</strong>, Microsoft no permite usar tu contraseña normal en servidores SMTP. Debes generar una contraseña especial para aplicaciones:
                    </p>
                    <ol className="list-decimal pl-4 space-y-1 text-amber-950">
                      <li>
                        Ingresa a tu cuenta de Microsoft en:{' '}
                        <a
                          href="https://account.microsoft.com/security"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold underline text-blue-700 inline-flex items-center gap-0.5"
                        >
                          account.microsoft.com/security <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </li>
                      <li>Ve a <strong>"Opciones de seguridad avanzadas"</strong>.</li>
                      <li>En la sección <strong>"Contraseñas de aplicaciones"</strong>, haz clic en <em>Crear una nueva contraseña de aplicación</em>.</li>
                      <li>Copia esa clave generada y pégala en el campo de contraseña de este sistema.</li>
                    </ol>
                  </div>

                  {/* CÓMO ENVIAR FACTURAS */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                    <span className="font-bold text-slate-900 block">
                      ¿Cómo enviar los documentos y facturas desde tu PC?
                    </span>
                    <p className="text-slate-600">
                      Una vez guardado tu Hotmail, en la barra superior haz clic en <strong>"Enviar Correo / Facturas"</strong>. El sistema genera el PDF oficial automáticamente y además te permite subir facturas y cotizaciones en PDF/Excel desde tu PC para enviarlos juntos al cliente.
                    </p>
                  </div>
                </div>
              </div>

              {/* GUÍA 2: DOMINIO PERSONALIZADO */}
              <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      Guía: Cómo Cambiar el Nombre del URL a safeworkcorporationadmin.com
                    </h5>
                  </div>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-400/30">
                    Dominio Propio .com
                  </span>
                </div>

                <div className="p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
                  {/* ¿QUÉ ES Y QUÉ NECESITAS? */}
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <h6 className="font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ¿Qué necesitas?
                    </h6>
                    <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-emerald-900">
                      <li>
                        Comprar el dominio <code>safeworkcorporationadmin.com</code> (o <code>safeworkcorporation.com</code>) en cualquier proveedor de dominios (cuesta aprox. $9 a $12 USD al año).
                      </li>
                      <li>
                        Acceso al panel de administración DNS de tu proveedor de dominio (Namecheap, GoDaddy, Hostinger, DonDominio o Google Domains / Squarespace).
                      </li>
                    </ul>
                  </div>

                  {/* PASOS DE CONFIGURACIÓN */}
                  <div className="space-y-3">
                    <h6 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Paso a paso para vincular tu dominio:
                    </h6>

                    <div className="space-y-3">
                      <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <strong className="text-slate-900 block text-xs mb-1">
                          Paso 1: Registra tu dominio
                        </strong>
                        <p className="text-[11.5px] text-slate-600">
                          Entra a un registrador confiable (ej: <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Namecheap</a>, <a href="https://www.godaddy.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">GoDaddy</a> o <a href="https://www.hostinger.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Hostinger</a>), busca <code>safeworkcorporationadmin.com</code> y realiza la compra.
                        </p>
                      </div>

                      <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <strong className="text-slate-900 block text-xs mb-1">
                          Paso 2: Conectar con Google Cloud Run (Donde está alojada la app)
                        </strong>
                        <p className="text-[11.5px] text-slate-600 mb-2">
                          Tu app corre en Google Cloud Run. Para asignarle el dominio propio:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-700">
                          <li>Entra a la Consola de Google Cloud (<a href="https://console.cloud.google.com/run" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">console.cloud.google.com/run</a>).</li>
                          <li>Haz clic en <strong>"Administrar dominios personalizados"</strong> (Manage custom domains).</li>
                          <li>Haz clic en <strong>"Agregar asignación"</strong> (Add mapping).</li>
                          <li>Selecciona el servicio de tu applet e introduce tu dominio: <code>safeworkcorporationadmin.com</code>.</li>
                        </ol>
                      </div>

                      <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <strong className="text-slate-900 block text-xs mb-1">
                          Paso 3: Agregar los registros DNS en tu registrador
                        </strong>
                        <p className="text-[11.5px] text-slate-600 mb-2">
                          Google Cloud te entregará unos registros DNS (tipo <code>CNAME</code> o <code>A</code>). Ve a tu panel de GoDaddy/Namecheap en "DNS Management" y agrégalos:
                        </p>
                        <div className="bg-white p-2.5 rounded-lg border border-slate-300 font-mono text-[10.5px] space-y-1 text-slate-800">
                          <div><strong>Tipo:</strong> CNAME &nbsp;|&nbsp; <strong>Nombre (Host):</strong> www &nbsp;|&nbsp; <strong>Valor:</strong> ghs.googlehosted.com</div>
                          <div><strong>Tipo:</strong> A &nbsp;|&nbsp; <strong>Nombre (Host):</strong> @ &nbsp;|&nbsp; <strong>Valor:</strong> (IPs provistas por Google)</div>
                        </div>
                      </div>

                      <div className="p-3 border border-slate-200 rounded-xl bg-slate-50">
                        <strong className="text-slate-900 block text-xs mb-1">
                          Paso 4: Certificado de Seguridad SSL Gratis Automático
                        </strong>
                        <p className="text-[11.5px] text-slate-600">
                          Google Cloud Run emite y renueva automáticamente el certificado <strong>HTTPS seguro (candado verde)</strong> sin costo alguno. Una vez propagado el DNS (tarda de 15 minutos a 2 horas), podrás ingresar directamente desde cualquier computadora del mundo a:
                        </p>
                        <div className="mt-2 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 font-mono font-bold text-center">
                          https://safeworkcorporationadmin.com
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Los cambios se guardan localmente en tu navegador.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                Guardar Configuración
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
