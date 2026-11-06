/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ServiceForm } from './components/ServiceForm';
import { OfficialSheet } from './components/OfficialSheet';
import { ProformaForm } from './components/ProformaForm';
import { OfficialProformaSheet } from './components/OfficialProformaSheet';
import { SignatureModal } from './components/SignatureModal';
import { EmailModal } from './components/EmailModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ProformaHistoryDrawer } from './components/ProformaHistoryDrawer';
import { SettingsModal } from './components/SettingsModal';
import { LoginScreen } from './components/LoginScreen';
import { generatePdfFromElement } from './utils/pdfGenerator';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredReports,
  saveStoredReports,
  getCurrentReport,
  saveCurrentReport,
  createNewReport,
  getStoredProformas,
  saveStoredProformas,
  getCurrentProforma,
  saveCurrentProforma,
  createNewProforma,
} from './utils/storage';
import {
  ServiceReport,
  DigitalSignature,
  CompanySettings,
  Proforma,
} from './types';
import {
  Send,
  Download,
  PenTool,
  CheckCircle2,
  Printer,
  Wrench,
  Receipt,
  FileSpreadsheet,
  Calendar,
  Building2,
  Plus,
} from 'lucide-react';

const getInitialAuth = (): { isAuth: boolean; user: string } => {
  try {
    const local = localStorage.getItem('safework_auth_session');
    const session = sessionStorage.getItem('safework_auth_session');
    const raw = local || session;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.user === 'adminwork') {
        return { isAuth: true, user: parsed.user };
      }
    }
  } catch (e) {
    console.error('Error checking auth:', e);
  }
  return { isAuth: false, user: '' };
};

export default function App() {
  const [auth, setAuth] = useState<{ isAuth: boolean; user: string }>(getInitialAuth);
  const [settings, setSettings] = useState<CompanySettings>(getStoredSettings);

  // Synchronize browser URL to /safeworkcorporationadmin
  useEffect(() => {
    const targetPath = '/safeworkcorporationadmin';
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(null, '', targetPath + window.location.search + window.location.hash);
    }
  }, []);

  // Active module: 'services' | 'proformas'
  const [activeModule, setActiveModule] = useState<'services' | 'proformas'>('services');

  // Reports state
  const [reports, setReports] = useState<ServiceReport[]>(getStoredReports);
  const [currentReport, setCurrentReport] = useState<ServiceReport>(getCurrentReport);

  // Proformas state
  const [proformas, setProformas] = useState<Proforma[]>(getStoredProformas);
  const [currentProforma, setCurrentProforma] = useState<Proforma>(getCurrentProforma);

  // View tabs
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Modals state
  const [signatureModalState, setSignatureModalState] = useState<{
    isOpen: boolean;
    type: 'client' | 'technician';
  }>({
    isOpen: false,
    type: 'client',
  });
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isProformaHistoryOpen, setIsProformaHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'logo' | 'payment' | 'company' | 'smtp' | 'guides'>('logo');

  // Status and PDF generation
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const printReportRef = useRef<HTMLDivElement>(null);
  const printProformaRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ---------------- SERVICE REPORT HANDLERS ----------------
  const handleReportChange = (updated: ServiceReport) => {
    setCurrentReport(updated);
    saveCurrentReport(updated);

    const updatedReports = reports.map((r) => (r.id === updated.id ? updated : r));
    if (!reports.some((r) => r.id === updated.id)) {
      updatedReports.unshift(updated);
    }
    setReports(updatedReports);
    saveStoredReports(updatedReports);
  };

  const handleCreateNewReport = () => {
    const nextNumber = reports.length + 1;
    const newRep = createNewReport(nextNumber, settings);
    setCurrentReport(newRep);
    saveCurrentReport(newRep);
    const updatedReports = [newRep, ...reports];
    setReports(updatedReports);
    saveStoredReports(updatedReports);
    setActiveTab('editor');
    showToast(`Nueva hoja de servicio creada (${newRep.reportNumber}).`);
  };

  const handleDuplicateReport = (rep: ServiceReport) => {
    const nextNumber = reports.length + 1;
    const today = new Date();
    const duplicated: ServiceReport = {
      ...rep,
      id: `rep-${Date.now()}`,
      reportNumber: `N·${String(nextNumber).padStart(9, '0')}`,
      date: {
        year: today.getFullYear().toString(),
        month: String(today.getMonth() + 1).padStart(2, '0'),
        day: String(today.getDate()).padStart(2, '0'),
      },
      clientSignature: {
        signatureDataUrl: '',
        name: rep.clientSignature.name,
        idNumber: rep.clientSignature.idNumber,
        role: rep.clientSignature.role,
        signedAt: '',
      },
      technicianSignature: {
        signatureDataUrl: '',
        name: settings.technicianName,
        idNumber: rep.technicianSignature.idNumber,
        role: settings.technicianTitle,
        signedAt: '',
      },
      status: 'borrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentLog: [],
    };

    setCurrentReport(duplicated);
    saveCurrentReport(duplicated);
    const updatedList = [duplicated, ...reports];
    setReports(updatedList);
    saveStoredReports(updatedList);
    showToast(`Hoja duplicada como nuevo reporte ${duplicated.reportNumber}.`);
  };

  const handleDeleteReport = (id: string) => {
    const updated = reports.filter((r) => r.id !== id);
    setReports(updated);
    saveStoredReports(updated);
    if (currentReport.id === id && updated.length > 0) {
      setCurrentReport(updated[0]);
      saveCurrentReport(updated[0]);
    }
    showToast('Hoja eliminada del historial.');
  };

  // ---------------- PROFORMA HANDLERS ----------------
  const handleProformaChange = (updated: Proforma) => {
    setCurrentProforma(updated);
    saveCurrentProforma(updated);

    const updatedList = proformas.map((p) => (p.id === updated.id ? updated : p));
    if (!proformas.some((p) => p.id === updated.id)) {
      updatedList.unshift(updated);
    }
    setProformas(updatedList);
    saveStoredProformas(updatedList);
  };

  const handleCreateNewProforma = () => {
    const nextNumber = proformas.length + 1;
    const newPrf = createNewProforma(nextNumber, settings);
    setCurrentProforma(newPrf);
    saveCurrentProforma(newPrf);
    const updatedList = [newPrf, ...proformas];
    setProformas(updatedList);
    saveStoredProformas(updatedList);
    setActiveTab('editor');
    showToast(`Nueva cotización creada (${newPrf.proformaNumber}).`);
  };

  const handleCreateProformaFromCurrentReport = () => {
    const nextNumber = proformas.length + 1;
    const newPrf = createNewProforma(nextNumber, settings, currentReport);
    setCurrentProforma(newPrf);
    saveCurrentProforma(newPrf);
    const updatedList = [newPrf, ...proformas];
    setProformas(updatedList);
    saveStoredProformas(updatedList);
    setActiveModule('proformas');
    setActiveTab('editor');
    showToast(`¡Proforma ${newPrf.proformaNumber} creada a partir de la Hoja de Servicio!`);
  };

  const handleDuplicateProforma = (prf: Proforma) => {
    const nextNumber = proformas.length + 1;
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + prf.validUntilDays);
    const expirationDate = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')}`;

    const duplicated: Proforma = {
      ...prf,
      id: `prf-${Date.now()}`,
      proformaNumber: `PRF-${year}-${String(nextNumber).padStart(4, '0')}`,
      date: { year, month, day },
      expirationDate,
      clientSignature: {
        signatureDataUrl: '',
        name: prf.clientSignature?.name || '',
        idNumber: prf.clientSignature?.idNumber || '',
        role: prf.clientSignature?.role || 'Aprobación / Compras',
        signedAt: '',
      },
      technicianSignature: {
        signatureDataUrl: '',
        name: settings.technicianName,
        idNumber: settings.ruc.replace(/[^\d]/g, '') || '',
        role: settings.technicianTitle,
        signedAt: '',
      },
      status: 'borrador',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentLog: [],
    };

    setCurrentProforma(duplicated);
    saveCurrentProforma(duplicated);
    const updatedList = [duplicated, ...proformas];
    setProformas(updatedList);
    saveStoredProformas(updatedList);
    showToast(`Cotización duplicada como ${duplicated.proformaNumber}.`);
  };

  const handleDeleteProforma = (id: string) => {
    const updated = proformas.filter((p) => p.id !== id);
    setProformas(updated);
    saveStoredProformas(updated);
    if (currentProforma.id === id && updated.length > 0) {
      setCurrentProforma(updated[0]);
      saveCurrentProforma(updated[0]);
    }
    showToast('Proforma eliminada del historial.');
  };

  // ---------------- SIGNATURES ----------------
  const handleOpenSignatureModal = (type: 'client' | 'technician') => {
    setSignatureModalState({
      isOpen: true,
      type,
    });
  };

  const handleSaveSignature = (sig: DigitalSignature) => {
    if (activeModule === 'services') {
      const updated: ServiceReport = {
        ...currentReport,
        updatedAt: new Date().toISOString(),
        ...(signatureModalState.type === 'client'
          ? { clientSignature: sig }
          : { technicianSignature: sig }),
      };

      if (
        (signatureModalState.type === 'client' && currentReport.technicianSignature?.signatureDataUrl) ||
        (signatureModalState.type === 'technician' && currentReport.clientSignature?.signatureDataUrl)
      ) {
        updated.status = 'firmado';
      }

      handleReportChange(updated);
    } else {
      const updated: Proforma = {
        ...currentProforma,
        updatedAt: new Date().toISOString(),
        ...(signatureModalState.type === 'client'
          ? { clientSignature: sig }
          : { technicianSignature: sig }),
      };

      if (signatureModalState.type === 'client' && sig.signatureDataUrl) {
        updated.status = 'aprobada';
      }

      handleProformaChange(updated);
    }

    showToast(
      `Firma digital de ${
        signatureModalState.type === 'client' ? 'cliente' : 'técnico / comercial'
      } guardada con éxito.`
    );
  };

  // ---------------- PDF GENERATION ----------------
  const getGeneratedPdf = async () => {
    if (activeModule === 'services') {
      const visibleElement = document.getElementById('official-sheet-container');
      const printElement = document.getElementById('official-sheet-print-source');
      const element = visibleElement || printElement;
      if (!element) {
        throw new Error('No se encontró el contenedor de la hoja oficial.');
      }
      const cleanFilename = `Hoja_Servicio_${currentReport.reportNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      return await generatePdfFromElement(element, cleanFilename);
    } else {
      const visibleElement = document.getElementById('official-proforma-container');
      const printElement = document.getElementById('official-proforma-print-source');
      const element = visibleElement || printElement;
      if (!element) {
        throw new Error('No se encontró el contenedor de la cotización oficial.');
      }
      const cleanFilename = `Proforma_${currentProforma.proformaNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      return await generatePdfFromElement(element, cleanFilename);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const { download } = await getGeneratedPdf();
      download();
      showToast(
        activeModule === 'services'
          ? '¡PDF de la Hoja de Servicio descargado exitosamente!'
          : '¡PDF de la Proforma / Cotización descargado exitosamente!'
      );
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      alert('Hubo un error al generar el PDF: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Save settings
  const handleSaveSettings = (newSettings: CompanySettings, applyToCurrentProforma = true) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);

    // Update in current documents
    handleReportChange({ ...currentReport, companyInfo: newSettings });

    const updatedCommercialTerms = {
      ...currentProforma.commercialTerms,
      ...(applyToCurrentProforma && newSettings.defaultPaymentMethod
        ? { paymentMethod: newSettings.defaultPaymentMethod }
        : {}),
      ...(applyToCurrentProforma && newSettings.defaultDeliveryTime
        ? { deliveryTime: newSettings.defaultDeliveryTime }
        : {}),
      ...(applyToCurrentProforma && newSettings.defaultBankingDetails
        ? { bankingDetails: newSettings.defaultBankingDetails }
        : {}),
    };

    handleProformaChange({
      ...currentProforma,
      companyInfo: newSettings,
      commercialTerms: updatedCommercialTerms,
      documentTitle: newSettings.defaultDocumentTitle || currentProforma.documentTitle,
    });
    showToast('Configuración institucional actualizada.');
  };

  // Quick logo upload handler from PC
  const handleDirectLogoUpload = (logoDataUrl: string) => {
    const updatedSettings = {
      ...settings,
      logoUrl: logoDataUrl,
    };
    handleSaveSettings(updatedSettings, false);
    showToast('¡Logotipo oficial actualizado desde tu PC con éxito!');
  };

  // After email sent
  const handleDocumentSent = (sentTo: string, previewUrl?: string) => {
    if (activeModule === 'services') {
      const updated: ServiceReport = {
        ...currentReport,
        status: 'enviado',
        sentLog: [
          ...(currentReport.sentLog || []),
          { sentTo, sentAt: new Date().toISOString(), previewUrl },
        ],
      };
      handleReportChange(updated);
    } else {
      const updated: Proforma = {
        ...currentProforma,
        status: 'enviada',
        sentLog: [
          ...(currentProforma.sentLog || []),
          { sentTo, sentAt: new Date().toISOString(), previewUrl },
        ],
      };
      handleProformaChange(updated);
    }
    showToast(`Documento enviado exitosamente a ${sentTo}`);
  };

  // If user is not authenticated, show the login screen
  if (!auth.isAuth) {
    return (
      <LoginScreen
        companyLogoUrl={settings.logoUrl}
        onLoginSuccess={(user) => {
          setAuth({ isAuth: true, user });
          showToast('¡Sesión de administrador iniciada con éxito!');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR WITH MODULE SWITCHER */}
      <Navbar
        activeModule={activeModule}
        onSelectModule={(mod) => {
          setActiveModule(mod);
          setActiveTab('editor');
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        documentNumber={
          activeModule === 'services'
            ? currentReport.reportNumber
            : currentProforma.proformaNumber
        }
        onOpenSignatureModal={handleOpenSignatureModal}
        onOpenEmailModal={() => setIsEmailModalOpen(true)}
        onOpenHistory={() => {
          if (activeModule === 'services') {
            setIsHistoryOpen(true);
          } else {
            setIsProformaHistoryOpen(true);
          }
        }}
        onOpenSettings={() => {
          setSettingsModalTab('logo');
          setIsSettingsOpen(true);
        }}
        onOpenSettingsTab={(tab) => {
          setSettingsModalTab(tab);
          setIsSettingsOpen(true);
        }}
        companyLogoUrl={settings.logoUrl}
        onUploadLogo={handleDirectLogoUpload}
        currentUser={auth.user}
        onLogout={() => {
          localStorage.removeItem('safework_auth_session');
          sessionStorage.removeItem('safework_auth_session');
          setAuth({ isAuth: false, user: '' });
          showToast('Has cerrado la sesión de administrador.');
        }}
        onCreateNew={
          activeModule === 'services'
            ? handleCreateNewReport
            : handleCreateNewProforma
        }
        onCreateProformaFromReport={handleCreateProformaFromCurrentReport}
        onDownloadPdf={handleDownloadPdf}
        onPrint={handlePrint}
        isGeneratingPdf={isGeneratingPdf}
        historyCount={reports.length}
        proformasCount={proformas.length}
      />

      {/* SUB-HEADER STATUS STRIP */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 print:hidden shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {activeModule === 'services' ? (
            /* SERVICES STATUS STRIP */
            <>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">
                  Cliente: <strong className="text-blue-600">{currentReport.client.name || 'Sin especificar'}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">
                  Equipo: <span className="font-medium">{currentReport.equipment.name || 'Sin equipo'}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Convert to Proforma button */}
                <button
                  type="button"
                  onClick={handleCreateProformaFromCurrentReport}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>Crear Proforma</span>
                </button>

                {/* Client signature indicator */}
                <button
                  onClick={() => handleOpenSignatureModal('client')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                    currentReport.clientSignature?.signatureDataUrl
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  {currentReport.clientSignature?.signatureDataUrl ? 'Cliente: Firmado' : 'Falta Firma Cliente'}
                </button>

                {/* Tech signature indicator */}
                <button
                  onClick={() => handleOpenSignatureModal('technician')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                    currentReport.technicianSignature?.signatureDataUrl
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  {currentReport.technicianSignature?.signatureDataUrl ? 'Técnico: Firmado' : 'Falta Firma Técnico'}
                </button>
              </div>
            </>
          ) : (
            /* PROFORMAS STATUS STRIP */
            <>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700">
                  Cliente: <strong className="text-blue-600">{currentProforma.client.name || 'Sin especificar'}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">
                  Total:{' '}
                  <strong className="text-slate-900 font-mono text-sm">
                    ${Number(currentProforma.total || 0).toFixed(2)} USD
                  </strong>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">
                  Vence: {currentProforma.expirationDate || 'N/A'} ({currentProforma.validUntilDays} días)
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => handleOpenSignatureModal('technician')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                    currentProforma.technicianSignature?.signatureDataUrl
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  {currentProforma.technicianSignature?.signatureDataUrl ? 'Emitente: Firmado' : 'Falta Firma Safe Work'}
                </button>

                <button
                  onClick={() => handleOpenSignatureModal('client')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                    currentProforma.clientSignature?.signatureDataUrl
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  {currentProforma.clientSignature?.signatureDataUrl ? 'Cliente: Aprobada' : 'Aprobación Opcional'}
                </button>

                <button
                  type="button"
                  onClick={handleCreateNewProforma}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                  title="Crear una nueva proforma en blanco"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Proforma
                </button>

                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Cotizar por Correo
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {activeModule === 'services' ? (
          /* ================= SERVICE REPORTS VIEW ================= */
          activeTab === 'editor' ? (
            <div className="animate-fade-in">
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    Hoja de Servicio Técnico
                  </h1>
                  <p className="text-xs text-slate-500">
                    Rellena los campos técnicos y firma digitalmente. Los cambios se sincronizan en tiempo real.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCreateProformaFromCurrentReport}
                    className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-amber-300"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-700" />
                    Crear Proforma desde esta Hoja
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    Ver hoja oficial 1:1 →
                  </button>
                </div>
              </div>

              <ServiceForm
                report={currentReport}
                onChange={handleReportChange}
                onOpenSignatureModal={handleOpenSignatureModal}
              />
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="w-full max-w-[850px] mb-4 flex items-center justify-between gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  ← Volver al formulario de edición
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar PDF
                  </button>
                </div>
              </div>

              {/* Official 1:1 Sheet Component */}
              <div className="w-full flex justify-center pb-12">
                <OfficialSheet
                  report={currentReport}
                  onOpenSignatureModal={handleOpenSignatureModal}
                />
              </div>
            </div>
          )
        ) : (
          /* ================= PROFORMAS VIEW ================= */
          activeTab === 'editor' ? (
            <div className="animate-fade-in">
              <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    Cotizaciones y Proformas
                  </h1>
                  <p className="text-xs text-slate-500">
                    Crea propuestas comerciales detalladas, calcula IVA y descuentos, y genera el PDF formal con firmas.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCreateNewProforma}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
                    title="Crear una nueva proforma en blanco"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Nueva Proforma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    Ver cotización oficial 1:1 →
                  </button>
                </div>
              </div>

              <ProformaForm
                proforma={currentProforma}
                onChange={handleProformaChange}
                onOpenSignatureModal={handleOpenSignatureModal}
                onCreateNew={handleCreateNewProforma}
              />
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col items-center">
              <div className="w-full max-w-[850px] mb-4 flex items-center justify-between gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  ← Volver al editor de proforma
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCreateNewProforma}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Nueva Proforma
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir Proforma
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar PDF
                  </button>
                </div>
              </div>

              {/* Official 1:1 Proforma Sheet */}
              <div className="w-full flex justify-center pb-12">
                <OfficialProformaSheet
                  proforma={currentProforma}
                  onOpenSignatureModal={handleOpenSignatureModal}
                  onUploadLogo={handleDirectLogoUpload}
                  onOpenSettings={() => {
                    setSettingsModalTab('payment');
                    setIsSettingsOpen(true);
                  }}
                />
              </div>
            </div>
          )
        )}

        {/* HIDDEN PRINT / CAPTURE CONTAINER FOR HIGH-RES PDF EXPORT */}
        <div
          id="print-master-wrapper"
          className="fixed left-[-9999px] top-[-9999px] w-[850px] bg-white print:static print:w-full print:block"
        >
          {activeModule === 'services' ? (
            <div id="official-sheet-print-source" ref={printReportRef}>
              <OfficialSheet
                report={currentReport}
                onOpenSignatureModal={handleOpenSignatureModal}
                readOnly={false}
              />
            </div>
          ) : (
            <div id="official-proforma-print-source" ref={printProformaRef}>
              <OfficialProformaSheet
                proforma={currentProforma}
                onOpenSignatureModal={handleOpenSignatureModal}
                readOnly={false}
              />
            </div>
          )}
        </div>
      </main>

      {/* FLOATING ACTION BAR FOR MOBILE */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 p-2.5 shadow-lg flex items-center justify-around print:hidden">
        <button
          onClick={() => handleOpenSignatureModal('technician')}
          className="flex flex-col items-center text-[10px] font-bold text-slate-700"
        >
          <PenTool className="w-4 h-4 text-blue-600 mb-0.5" />
          Firma Emisor
        </button>
        <button
          onClick={() => handleOpenSignatureModal('client')}
          className="flex flex-col items-center text-[10px] font-bold text-slate-700"
        >
          <PenTool className="w-4 h-4 text-indigo-600 mb-0.5" />
          Firma Cliente
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="flex flex-col items-center text-[10px] font-bold text-slate-700"
        >
          <Download className="w-4 h-4 text-slate-600 mb-0.5" />
          PDF
        </button>
        <button
          onClick={() => setIsEmailModalOpen(true)}
          className="flex flex-col items-center text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <Send className="w-4 h-4 mb-0.5" />
          Enviar
        </button>
      </div>

      {/* SIGNATURE MODAL */}
      <SignatureModal
        isOpen={signatureModalState.isOpen}
        onClose={() => setSignatureModalState({ isOpen: false, type: 'client' })}
        type={signatureModalState.type}
        title={
          signatureModalState.type === 'client'
            ? activeModule === 'proformas'
              ? 'Firma de Aceptación / Aprobación del Cliente'
              : 'Firma Digital del Cliente'
            : activeModule === 'proformas'
            ? 'Firma Emitente Safe Work Corporation'
            : 'Firma Digital del Técnico'
        }
        initialSignature={
          activeModule === 'services'
            ? signatureModalState.type === 'client'
              ? currentReport.clientSignature
              : currentReport.technicianSignature
            : signatureModalState.type === 'client'
            ? currentProforma.clientSignature
            : currentProforma.technicianSignature
        }
        onSaveSignature={handleSaveSignature}
      />

      {/* EMAIL SEND MODAL (SUPPORTS BOTH HOJAS AND PROFORMAS) */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        documentMode={activeModule === 'proformas' ? 'proforma' : 'service'}
        report={currentReport}
        proforma={currentProforma}
        companySettings={settings}
        onUpdateSettings={handleSaveSettings}
        onGeneratePdf={getGeneratedPdf}
        onReportSent={handleDocumentSent}
      />

      {/* HISTORY DRAWER FOR SERVICE REPORTS */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        reports={reports}
        currentReportId={currentReport.id}
        onSelectReport={(rep) => setCurrentReport(rep)}
        onDuplicateReport={handleDuplicateReport}
        onDeleteReport={handleDeleteReport}
        onCreateNew={handleCreateNewReport}
      />

      {/* HISTORY DRAWER FOR PROFORMAS */}
      <ProformaHistoryDrawer
        isOpen={isProformaHistoryOpen}
        onClose={() => setIsProformaHistoryOpen(false)}
        proformas={proformas}
        currentProformaId={currentProforma.id}
        onSelectProforma={(prf) => setCurrentProforma(prf)}
        onDuplicateProforma={handleDuplicateProforma}
        onDeleteProforma={handleDeleteProforma}
        onCreateNew={handleCreateNewProforma}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        initialTab={settingsModalTab}
      />
    </div>
  );
}
