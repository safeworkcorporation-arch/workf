import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  FileCheck,
  Settings,
  Share2,
  MessageCircle,
  Sparkles,
  Key,
  Server,
  Smartphone,
  Paperclip,
  FileText,
  Trash2,
  Plus,
  UploadCloud,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { ServiceReport, CompanySettings, Proforma } from '../types';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  report?: ServiceReport;
  proforma?: Proforma;
  documentMode?: 'service' | 'proforma';
  companySettings?: CompanySettings;
  onUpdateSettings?: (settings: CompanySettings) => void;
  onGeneratePdf: () => Promise<{ pdfBase64: string; pdfBlob: Blob; download: () => void }>;
  onReportSent?: (sentTo: string, previewUrl?: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  report,
  proforma,
  documentMode = 'service',
  companySettings,
  onUpdateSettings,
  onGeneratePdf,
  onReportSent,
}) => {
  // Active modal tab: 'send' | 'smtp' | 'alternatives'
  const [activeTab, setActiveTab] = useState<'send' | 'smtp' | 'alternatives'>('send');

  // Effective settings
  const currentSettings: CompanySettings =
    companySettings || (documentMode === 'proforma' ? proforma?.companyInfo : report?.companyInfo) || ({} as CompanySettings);

  const isProforma = documentMode === 'proforma' && Boolean(proforma);
  const docNumber = isProforma ? proforma?.proformaNumber : report?.reportNumber || 'N/A';
  const clientName = isProforma ? proforma?.client.name : report?.client.name || 'Cliente';
  const initialClientEmail = (isProforma ? proforma?.client.email : report?.client.email) || '';

  // Email fields
  const [toEmail, setToEmail] = useState(initialClientEmail);
  const [ccEmail, setCcEmail] = useState(currentSettings.defaultEmailCC || '');
  const [subject, setSubject] = useState(
    isProforma
      ? `Cotización / Proforma ${docNumber} - ${clientName} - Safe Work Corporation`
      : `Hoja de Servicio Técnico ${docNumber} - ${clientName} - Safe Work Corporation`
  );
  const [customMessage, setCustomMessage] = useState(
    isProforma
      ? `Estimado/a cliente,\n\nAdjunto le hacemos entrega formal de la Cotización / Proforma oficial N° ${docNumber} por un valor total de $${Number(proforma?.total || 0).toFixed(2)} USD, correspondiente a los servicios técnicos y repuestos solicitados.\n\nEl documento cuenta con validez de ${proforma?.validUntilDays || 15} días y el detalle comercial y técnico completo.\n\nAtentamente,\n${currentSettings.technicianName}\n${currentSettings.companyName}`
      : `Estimado/a cliente,\n\nAdjunto le hacemos entrega de la Hoja de Servicio Técnico oficial N° ${docNumber} correspondiente a los trabajos de mantenimiento realizados en su equipo ${report?.equipment.name || ''} (${report?.equipment.brand || ''}).\n\nEl documento cuenta con la debida validación y firma digital.\n\nAtentamente,\n${currentSettings.technicianName}\n${currentSettings.companyName}`
  );

  // Sync state if proforma or report changes when opened
  React.useEffect(() => {
    if (isOpen) {
      const email = (isProforma ? proforma?.client.email : report?.client.email) || '';
      setToEmail(email);
      setSubject(
        isProforma
          ? `Cotización / Proforma ${docNumber} - ${clientName} - Safe Work Corporation`
          : `Hoja de Servicio Técnico ${docNumber} - ${clientName} - Safe Work Corporation`
      );
      setCustomMessage(
        isProforma
          ? `Estimado/a cliente,\n\nAdjunto le hacemos entrega formal de la Cotización / Proforma oficial N° ${docNumber} por un valor total de $${Number(proforma?.total || 0).toFixed(2)} USD, correspondiente a los servicios técnicos y repuestos solicitados.\n\nEl documento cuenta con validez de ${proforma?.validUntilDays || 15} días y el detalle comercial y técnico completo.\n\nAtentamente,\n${currentSettings.technicianName}\n${currentSettings.companyName}`
          : `Estimado/a cliente,\n\nAdjunto le hacemos entrega de la Hoja de Servicio Técnico oficial N° ${docNumber} correspondiente a los trabajos de mantenimiento realizados en su equipo ${report?.equipment.name || ''} (${report?.equipment.brand || ''}).\n\nEl documento cuenta con la debida validación y firma digital.\n\nAtentamente,\n${currentSettings.technicianName}\n${currentSettings.companyName}`
      );
    }
  }, [isOpen, docNumber, isProforma, clientName]);

  // Sending status
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isTestDelivery, setIsTestDelivery] = useState(false);

  // SMTP Settings State
  const [smtpForm, setSmtpForm] = useState({
    host: currentSettings.smtpConfig?.host || 'smtp.gmail.com',
    port: currentSettings.smtpConfig?.port || 465,
    secure: currentSettings.smtpConfig?.secure ?? true,
    user: currentSettings.smtpConfig?.user || currentSettings.technicianEmail || '',
    pass: currentSettings.smtpConfig?.pass || '',
    provider: (currentSettings.smtpConfig?.provider || 'gmail') as
      | 'gmail'
      | 'outlook'
      | 'yahoo'
      | 'custom',
  });
  const [showGmailGuide, setShowGmailGuide] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [smtpSaveMessage, setSmtpSaveMessage] = useState<string | null>(null);

  // Sharing states
  const [isSharingPdf, setIsSharingPdf] = useState(false);

  // PC Attachments State (Invoices, XML, PDF, Receipts from PC)
  const [pcAttachments, setPcAttachments] = useState<
    Array<{
      id: string;
      name: string;
      size: number;
      type: string;
      base64: string;
    }>
  >([]);
  const [includeSystemPdf, setIncludeSystemPdf] = useState(true);

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper to process files from PC
  const processFilesFromPC = (fileList: FileList | File[]) => {
    Array.from(fileList).forEach((file) => {
      if (file.size > 25 * 1024 * 1024) {
        alert(`El archivo "${file.name}" supera el límite de 25MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPcAttachments((prev) => {
          // Avoid duplicate files with same name and size
          if (prev.some((item) => item.name === file.name && item.size === file.size)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              size: file.size,
              type: file.type || 'application/octet-stream',
              base64,
            },
          ];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddFilesFromPC = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFilesFromPC(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemovePcAttachment = (id: string) => {
    setPcAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Quick preset templates
  const handleApplyInvoiceTemplate = () => {
    setSubject(`Factura Electrónica y Comprobantes - ${clientName} - Safe Work Corporation`);
    setCustomMessage(
      `Estimado/a cliente,\n\nAdjunto le hacemos entrega de la Factura Electrónica y los comprobantes correspondientes a los servicios y suministros técnicos brindados por Safe Work Corporation.\n\nFavor confirmar la recepción del presente correo para nuestros registros contables.\n\nAtentamente,\n${currentSettings.technicianName}\n${currentSettings.companyName}\nR.U.C. ${currentSettings.ruc}\nTel: ${currentSettings.technicianPhone}`
    );
  };

  if (!isOpen) return null;

  const isConfigured = Boolean(
    currentSettings.smtpConfig?.user?.trim() && currentSettings.smtpConfig?.pass?.trim()
  );

  // Provider presets
  const handleSelectProvider = (provider: 'gmail' | 'outlook' | 'yahoo' | 'custom') => {
    setSmtpTestResult(null);
    setSmtpSaveMessage(null);
    const currentUser = smtpForm.user || currentSettings.technicianEmail || '';

    if (provider === 'gmail') {
      setSmtpForm({
        ...smtpForm,
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: currentUser.includes('@gmail.com') ? currentUser : currentUser,
        provider: 'gmail',
      });
      setShowGmailGuide(true);
    } else if (provider === 'outlook') {
      setSmtpForm({
        ...smtpForm,
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        user: currentUser.includes('@hotmail') || currentUser.includes('@outlook') ? currentUser : '',
        provider: 'outlook',
      });
      setShowGmailGuide(false);
    } else if (provider === 'yahoo') {
      setSmtpForm({
        ...smtpForm,
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        user: currentUser.includes('@yahoo') ? currentUser : '',
        provider: 'yahoo',
      });
      setShowGmailGuide(false);
    } else {
      setSmtpForm({
        ...smtpForm,
        host: smtpForm.host || 'mail.miempresa.com',
        port: 587,
        secure: false,
        provider: 'custom',
      });
      setShowGmailGuide(false);
    }
  };

  // Test SMTP connection via backend
  const handleTestSmtp = async () => {
    if (!smtpForm.user.trim() || !smtpForm.pass.trim()) {
      setSmtpTestResult({
        success: false,
        message: 'Por favor ingresa tu correo remitente y la contraseña o clave de aplicación.',
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
          smtpConfig: smtpForm,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al validar la conexión SMTP.');
      }

      setSmtpTestResult({
        success: true,
        message: data.message || '¡Conexión SMTP exitosa!',
      });
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.message || 'Error al verificar el servidor de correo.',
      });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // Save SMTP settings permanently
  const handleSaveSmtp = () => {
    if (!smtpForm.user.trim() || !smtpForm.pass.trim()) {
      setSmtpTestResult({
        success: false,
        message: 'Debes ingresar el correo y la contraseña para guardar la configuración.',
      });
      return;
    }

    const updatedSettings: CompanySettings = {
      ...currentSettings,
      smtpConfig: {
        host: smtpForm.host.trim(),
        port: Number(smtpForm.port) || 587,
        secure: Boolean(smtpForm.secure),
        user: smtpForm.user.trim(),
        pass: smtpForm.pass.trim(),
        provider: smtpForm.provider,
      },
    };

    if (onUpdateSettings) {
      onUpdateSettings(updatedSettings);
    }

    setSmtpSaveMessage('¡Configuración de correo guardada con éxito! Ya puedes enviar correos reales.');
    setTimeout(() => {
      setSmtpSaveMessage(null);
      setActiveTab('send');
    }, 1500);
  };

  // Send Email Handler
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail.trim()) {
      setStatus('error');
      setStatusMessage('Por favor ingresa al menos un correo de destino.');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setStatusMessage('');
    setIsTestDelivery(false);

    try {
      // Validation: Must include at least the system PDF or a file from PC
      if (!includeSystemPdf && pcAttachments.length === 0) {
        setStatus('error');
        setStatusMessage('Debes incluir el documento del sistema o adjuntar al menos una factura/documento desde tu PC.');
        setIsLoading(false);
        return;
      }

      // 1. Generate high-resolution PDF if requested
      let pdfBase64: string | undefined = undefined;
      if (includeSystemPdf) {
        const generated = await onGeneratePdf();
        pdfBase64 = generated.pdfBase64;
      }

      // 2. Prepare additional attachments from PC
      const additionalAttachments = pcAttachments.map((f) => ({
        filename: f.name,
        contentBase64: f.base64,
        contentType: f.type,
      }));

      const pcAttachmentsSummaryText =
        pcAttachments.length > 0
          ? `\n\n--------------------------------------------------\nDOCUMENTOS / FACTURAS ADJUNTAS DESDE PC:\n` +
            pcAttachments.map((f) => `• ${f.name} (${formatFileSize(f.size)})`).join('\n') +
            `\n--------------------------------------------------`
          : '';

      const pcAttachmentsHtml =
        pcAttachments.length > 0
          ? `
          <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
            <strong style="font-size: 11px; text-transform: uppercase; color: #334155; display: block; margin-bottom: 6px;">Facturas y Documentos Adjuntos desde PC:</strong>
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #0f172a; line-height: 1.6;">
              ${pcAttachments
                .map(
                  (f) =>
                    `<li><strong>${f.name}</strong> <span style="color: #64748b; font-size: 11px;">(${formatFileSize(
                      f.size
                    )})</span></li>`
                )
                .join('')}
            </ul>
          </div>
          `
          : '';

      // 3. Build plain text and official HTML email templates
      const plainTextBody = isProforma
        ? `${customMessage}

--------------------------------------------------
DOCUMENTO: Cotización / Proforma Oficial N° ${docNumber}
CLIENTE: ${clientName}
TOTAL A PAGAR: $${Number(proforma?.total || 0).toFixed(2)} USD
FORMA DE PAGO: ${proforma?.commercialTerms.paymentMethod || 'En su totalidad (100%)'}
VALIDEZ: ${proforma?.validUntilDays || 15} días
TIEMPO DE ENTREGA: ${proforma?.commercialTerms.deliveryTime || 'Inmediato'}
--------------------------------------------------
${includeSystemPdf ? `Se adjunta la Cotización Oficial completa en archivo PDF de alta resolución.\n` : ''}${pcAttachmentsSummaryText}

Atentamente,
${currentSettings.technicianName}
${currentSettings.companyName}
${currentSettings.address}
Tel: ${currentSettings.technicianPhone}
R.U.C. ${currentSettings.ruc}`
        : `${customMessage}

--------------------------------------------------
DOCUMENTO: Hoja de Servicio Técnico N° ${report?.reportNumber}
CLIENTE: ${report?.client.name}
EQUIPO: ${report?.equipment.name} (${report?.equipment.brand} ${report?.equipment.model})
FECHA: ${report?.date.year}-${report?.date.month}-${report?.date.day}
ESTADO DEL EQUIPO: ${report?.equipmentStatus}
--------------------------------------------------
${includeSystemPdf ? `Se adjunta la Hoja de Servicio Técnico oficial en archivo PDF con firmas digitales.\n` : ''}${pcAttachmentsSummaryText}

Atentamente,
${currentSettings.technicianName}
${currentSettings.companyName}
${currentSettings.address}
Tel: ${currentSettings.technicianPhone}
R.U.C. ${currentSettings.ruc}`;

      const htmlBody = isProforma
        ? `
        <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
          Cotización oficial y documentos adjuntos. Safe Work Corporation.
          &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 20px; color: #ffffff; text-align: center;">
            <h2 style="margin: 0; font-size: 17px; letter-spacing: 0.5px; color: #38bdf8;">${currentSettings.companyName}</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Cotización / Proforma Oficial N° ${docNumber}</p>
          </div>
          <div style="padding: 24px;">
            <p style="white-space: pre-line; line-height: 1.6; font-size: 13px; color: #334155; margin-top: 0;">
              ${customMessage.replace(/\n/g, '<br/>')}
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 18px 0;">
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr><td style="padding: 4px 0; color: #64748b; width: 35%;">Cliente:</td><td style="font-weight: bold; color: #0f172a;">${clientName}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">R.U.C. / C.I.:</td><td style="color: #0f172a;">${proforma?.client.rucOrCi || 'N/A'}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Validez:</td><td style="font-weight: 600;">${proforma?.validUntilDays} días (hasta ${proforma?.expirationDate || 'N/A'})</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Tiempo de Entrega:</td><td>${proforma?.commercialTerms.deliveryTime}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Forma de Pago:</td><td style="font-weight: bold; color: #0f172a;">${proforma?.commercialTerms.paymentMethod}</td></tr>
                <tr style="border-top: 1px solid #cbd5e1;"><td style="padding: 8px 0 2px 0; font-weight: bold; color: #0f172a;">Total Propuesta:</td><td style="padding: 8px 0 2px 0; font-weight: 900; font-size: 15px; color: #0284c7;">$${Number(proforma?.total || 0).toFixed(2)} USD</td></tr>
              </table>
            </div>
            ${pcAttachmentsHtml}
            ${
              includeSystemPdf
                ? `<p style="font-size: 12px; color: #475569; margin: 16px 0 0 0; line-height: 1.5;">
                    📎 <strong>Archivo Adjunto:</strong> Se adjunta la cotización oficial en archivo PDF con el desglose formal de ítems y firmas.
                  </p>`
                : ''
            }
          </div>
          <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">${currentSettings.companyName}</p>
            <p style="margin: 3px 0 0 0;">${currentSettings.address} • Tel: ${currentSettings.technicianPhone} • RUC: ${currentSettings.ruc}</p>
          </div>
        </div>
        `
        : `
        <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
          Hoja de servicio técnico oficial y documentos adjuntos. Safe Work Corporation.
          &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
        </div>
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #0f172a; padding: 20px; color: #ffffff; text-align: center;">
            <h2 style="margin: 0; font-size: 17px; letter-spacing: 0.5px; color: #38bdf8;">${currentSettings.companyName}</h2>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; text-transform: uppercase;">Hoja de Servicio Técnico N° ${report?.reportNumber}</p>
          </div>
          <div style="padding: 24px;">
            <p style="white-space: pre-line; line-height: 1.6; font-size: 13px; color: #334155; margin-top: 0;">
              ${customMessage.replace(/\n/g, '<br/>')}
            </p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 18px 0;">
              <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                <tr><td style="padding: 4px 0; color: #64748b; width: 35%;">Cliente:</td><td style="font-weight: bold; color: #0f172a;">${report?.client.name}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Equipo:</td><td style="font-weight: bold; color: #0f172a;">${report?.equipment.name} (${report?.equipment.brand} ${report?.equipment.model})</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Mantenimiento:</td><td style="text-transform: capitalize; font-weight: 600;">${report?.maintenanceType}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Estado del Equipo:</td><td style="text-transform: capitalize; font-weight: 600;">${report?.equipmentStatus}</td></tr>
                <tr><td style="padding: 4px 0; color: #64748b;">Fecha:</td><td>${report?.date.year}-${report?.date.month}-${report?.date.day}</td></tr>
              </table>
            </div>
            ${pcAttachmentsHtml}
            ${
              includeSystemPdf
                ? `<p style="font-size: 12px; color: #475569; margin: 16px 0 0 0; line-height: 1.5;">
                    📎 <strong>Archivo Adjunto:</strong> Se adjunta la Hoja Oficial completa en PDF con las firmas digitales de conformidad.
                  </p>`
                : ''
            }
          </div>
          <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-weight: bold; color: #1e293b;">${currentSettings.companyName}</p>
            <p style="margin: 3px 0 0 0;">${currentSettings.address} • Tel: ${currentSettings.technicianPhone} • RUC: ${currentSettings.ruc}</p>
          </div>
        </div>
      `;

      const cleanFilename = isProforma
        ? `Proforma_${(proforma?.proformaNumber || 'PRF').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        : `Hoja_Servicio_${(report?.reportNumber || 'REP').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

      // 4. Post to backend
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toEmail,
          cc: ccEmail,
          subject,
          text: plainTextBody,
          html: htmlBody,
          fromName: `${currentSettings.technicianName} - ${currentSettings.companyName}`,
          pdfBase64: includeSystemPdf ? pdfBase64 : undefined,
          filename: cleanFilename,
          additionalAttachments,
          smtpConfig: currentSettings.smtpConfig,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar el envío del correo');
      }

      if (data.isTest) {
        setIsTestDelivery(true);
        setStatus('warning');
        setStatusMessage(
          `⚠️ El correo fue generado en modo SIMULADOR (Ethereal Mail). NO se entregó a la bandeja real del cliente (${toEmail}). Para que llegue a clientes reales, configura tu correo en la pestaña "Configurar Mi Correo".`
        );
      } else {
        setIsTestDelivery(false);
        setStatus('success');
        setStatusMessage(
          `¡Correo entregado con éxito a la bandeja de ${toEmail}${
            ccEmail ? ` (con copia a ${ccEmail})` : ''
          }! Remitente: ${data.fromAddress || currentSettings.smtpConfig?.user}.`
        );
      }

      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }

      if (onReportSent) {
        onReportSent(toEmail, data.previewUrl);
      }
    } catch (err: any) {
      console.error('Send email error:', err);
      setStatus('error');
      setStatusMessage(err?.message || 'Error al conectar con el servidor de correo.');
    } finally {
      setIsLoading(false);
    }
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    const rawPhone = isProforma ? proforma?.client.phone : report?.client.phone;
    const cleanPhone = (rawPhone || '').replace(/[^0-9]/g, '');

    const text = isProforma
      ? `*SAFE WORK CORPORATION - COTIZACIÓN / PROFORMA*\n\n` +
        `Estimado/a *${clientName}*,\n` +
        `Le compartimos la Cotización Oficial *${docNumber}*:\n\n` +
        `• *Total Propuesta:* $${Number(proforma?.total || 0).toFixed(2)} USD\n` +
        `• *Ítems cotizados:* ${proforma?.items.length || 0} ítems (servicios / repuestos)\n` +
        `• *Validez:* ${proforma?.validUntilDays || 15} días\n` +
        `• *Tiempo de Entrega:* ${proforma?.commercialTerms.deliveryTime}\n` +
        `• *Forma de Pago:* ${proforma?.commercialTerms.paymentMethod}\n\n` +
        `_Adjuntamos la cotización oficial en formato PDF debidamente rubricada._`
      : `*SAFE WORK CORPORATION - HOJA DE SERVICIO TÉCNICO*\n\n` +
        `Estimado/a *${report?.client.name || 'Cliente'}*,\n` +
        `Le compartimos la Hoja de Servicio Oficial *${report?.reportNumber}* correspondiente a los trabajos de mantenimiento:\n\n` +
        `• *Equipo:* ${report?.equipment.name} (${report?.equipment.brand} ${report?.equipment.model})\n` +
        `• *Tipo de Servicio:* ${report?.maintenanceType?.toUpperCase()}\n` +
        `• *Estado del Equipo:* ${report?.equipmentStatus?.toUpperCase()}\n` +
        `• *Fecha:* ${report?.date.year}-${report?.date.month}-${report?.date.day}\n` +
        `• *Técnico Responsable:* ${currentSettings.technicianName} (Tel: ${currentSettings.technicianPhone})\n\n` +
        `_El documento oficial cuenta con firmas digitales. Le adjuntamos el archivo PDF correspondiente._`;

    const encoded = encodeURIComponent(text);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  // Web Share API (Direct mobile sharing of the actual PDF file)
  const handleNativeShare = async () => {
    try {
      setIsSharingPdf(true);
      const { pdfBlob } = await onGeneratePdf();
      const filename = isProforma
        ? `Proforma_${(proforma?.proformaNumber || 'PRF').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
        : `Hoja_Servicio_${(report?.reportNumber || 'REP').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: isProforma ? `Cotización ${docNumber}` : `Hoja de Servicio ${docNumber}`,
          text: isProforma
            ? `Cotización / Proforma Oficial N° ${docNumber} - ${clientName} - Safe Work Corporation`
            : `Hoja de Servicio Oficial N° ${docNumber} - ${clientName} - Safe Work Corporation`,
          files: [file],
        });
      } else {
        // Fallback: download directly
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Share error:', err);
      }
    } finally {
      setIsSharingPdf(false);
    }
  };

  // Open Gmail Web Composer
  const handleOpenGmailWeb = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      toEmail
    )}&cc=${encodeURIComponent(ccEmail)}&su=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(customMessage)}`;
    window.open(gmailUrl, '_blank');
  };

  // Open Outlook Web Composer
  const handleOpenOutlookWeb = () => {
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
      toEmail
    )}&cc=${encodeURIComponent(ccEmail)}&subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(customMessage)}`;
    window.open(outlookUrl, '_blank');
  };

  // Local mailto
  const handleOpenMailto = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?cc=${encodeURIComponent(
      ccEmail
    )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(customMessage)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Instant PDF Download
  const handleDownloadDirectPdf = async () => {
    try {
      const { download } = await onGeneratePdf();
      download();
    } catch (e: any) {
      alert('Error descargando PDF: ' + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold tracking-wide">
                {isProforma ? 'Entrega y Envío de Cotización / Proforma' : 'Entrega y Envío de Hoja Técnica'}
              </h3>
              <p className="text-[10px] text-slate-400">
                Documento Oficial {docNumber} • Safe Work Corporation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('send')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'send'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Enviar por Correo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('smtp')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 relative ${
              activeTab === 'smtp'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Configurar Mi Correo (Remitente)
            {!isConfigured && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Pendiente de configurar" />
            )}
            {isConfigured && (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('alternatives')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'alternatives'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            Vías Directas (WhatsApp / Web)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: SEND EMAIL */}
          {activeTab === 'send' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              {/* Delivery Server Status Banner */}
              {isConfigured ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Remitente Real Verificado: </span>
                      <span className="font-mono text-[11px] font-semibold text-emerald-950">
                        {currentSettings.smtpConfig?.user}
                      </span>
                      <span className="text-[10px] text-emerald-700 ml-1.5 uppercase font-bold">
                        ({currentSettings.smtpConfig?.provider || 'SMTP'})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('smtp')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-950 underline flex-shrink-0"
                  >
                    Modificar
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-950">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-amber-900 text-xs">
                        ¿Por qué no llegan los correos a tu cliente?
                      </strong>
                      <p className="text-[11px] text-amber-800 leading-normal mt-1">
                        El sistema no tiene conectado tu servidor de correo saliente (Gmail, Hotmail, Outlook o corporativo). Actualmente se procesa en modo <strong>simulador de pruebas (Ethereal)</strong> y no se entrega a bandejas reales.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200">
                    <button
                      type="button"
                      onClick={() => setActiveTab('smtp')}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Settings className="w-3.5 h-3.5" /> Conectar mi correo saliente (1 minuto)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('alternatives')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-all"
                    >
                      Enviar al instante por WhatsApp o Web
                    </button>
                  </div>
                </div>
              )}

              {/* Status alerts */}
              {status === 'success' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-start gap-2 text-emerald-900 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{statusMessage}</span>
                  </div>
                </div>
              )}

              {status === 'warning' && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 text-xs text-amber-950">
                  <div className="flex items-start gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{statusMessage}</span>
                  </div>
                  {previewUrl && (
                    <div className="pt-1 border-t border-amber-200 flex items-center justify-between">
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline text-[11px]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver simulación generada en Ethereal Sandbox
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTab('smtp')}
                        className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950"
                      >
                        Configurar correo real 👉
                      </button>
                    </div>
                  )}
                </div>
              )}

              {status === 'error' && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-900 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Error en el envío: </span>
                    <span>{statusMessage}</span>
                  </div>
                </div>
              )}

              {/* Form inputs */}
              <div className="grid grid-cols-1 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Destinatario Principal (Cliente) *
                  </label>
                  <input
                    type="email"
                    required
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    placeholder="cliente@empresa.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Con Copia (CC: Técnico y Supervisores)
                  </label>
                  <input
                    type="text"
                    value={ccEmail}
                    onChange={(e) => setCcEmail(e.target.value)}
                    placeholder="s.w.service0012@hotmail.com, sep9175@gmail.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-700 bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Separa múltiples correos con comas
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      Asunto del Correo
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleApplyInvoiceTemplate}
                        className="text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors"
                        title="Rellenar asunto y texto con formato formal de envío de Factura"
                      >
                        <Receipt className="w-3 h-3 text-amber-700" />
                        Plantilla Factura
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mensaje del Correo
                  </label>
                  <textarea
                    rows={4}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans bg-white"
                  />
                </div>

                {/* ATTACHMENTS SECTION: SYSTEM PDF + PC DOCUMENTS / INVOICES */}
                <div className="space-y-2.5 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        Facturas y Documentos Adjuntos
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Envía la hoja generada o adjunta facturas (PDF, XML, comprobantes) desde tu PC.
                      </p>
                    </div>
                    <label
                      htmlFor="pc-file-upload-input"
                      className="cursor-pointer text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all shadow-xs transform active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adjuntar desde mi PC</span>
                    </label>
                    <input
                      id="pc-file-upload-input"
                      type="file"
                      multiple
                      accept=".pdf,.xml,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      onChange={handleAddFilesFromPC}
                      className="hidden"
                    />
                  </div>

                  {/* System Document Card (Toggleable) */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      includeSystemPdf
                        ? 'bg-slate-50 border-slate-300'
                        : 'bg-slate-100/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="include-system-pdf"
                        checked={includeSystemPdf}
                        onChange={(e) => setIncludeSystemPdf(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="include-system-pdf" className="text-xs text-slate-800 cursor-pointer">
                        <span className="font-bold">
                          {isProforma ? 'Proforma Oficial (PDF): ' : 'Hoja de Servicio (PDF): '}
                        </span>
                        <span className="font-mono text-slate-600">
                          {isProforma ? `Proforma_${docNumber}.pdf` : `Hoja_Servicio_${docNumber}.pdf`}
                        </span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadDirectPdf}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                    >
                      <Download className="w-3 h-3" /> Descargar copia
                    </button>
                  </div>

                  {/* PC Uploaded Files List */}
                  {pcAttachments.map((file) => {
                    const isXml = file.name.toLowerCase().endsWith('.xml');
                    const isPdf = file.name.toLowerCase().endsWith('.pdf');
                    return (
                      <div
                        key={file.id}
                        className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs text-slate-800 animate-fade-in"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white ${
                              isXml
                                ? 'bg-emerald-600'
                                : isPdf
                                ? 'bg-red-600'
                                : 'bg-blue-600'
                            }`}
                          >
                            {isXml ? 'XML SRI' : isPdf ? 'PDF FACTURA' : 'DOC'}
                          </span>
                          <span className="font-bold text-slate-900 truncate max-w-[240px] sm:max-w-[340px]" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono font-medium">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePcAttachment(file.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Quitar este archivo adjunto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Drag and Drop Zone */}
                  <label
                    htmlFor="pc-file-upload-input"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) {
                        processFilesFromPC(e.dataTransfer.files);
                      }
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/40 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer transition-colors text-center text-xs text-slate-600"
                  >
                    <UploadCloud className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>
                      <strong>Haz clic aquí para seleccionar facturas de tu PC</strong> o arrástralas directamente (PDF, XML, Comprobantes)
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <button
                    type="button"
                    onClick={() => setActiveTab('alternatives')}
                    className="hover:text-blue-600 flex items-center gap-1 text-[11px] underline"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" /> Ver otras opciones de entrega
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-md flex items-center gap-2 transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generando PDF y enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Correo Automático
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: CONFIGURE SMTP */}
          {activeTab === 'smtp' && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1.5">
                <strong className="text-blue-900 font-bold flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Configura tu cuenta de correo saliente
                </strong>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Al ingresar tus credenciales una sola vez, las hojas de servicio se enviarán directamente a la bandeja de tus clientes con remitente oficial de tu empresa y llegarán a las bandejas CC que indiques.
                </p>
              </div>

              {/* Provider Buttons */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  1. Selecciona tu proveedor de correo:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectProvider('gmail')}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                      smtpForm.provider === 'gmail'
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
                      smtpForm.provider === 'outlook'
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
                      smtpForm.provider === 'yahoo'
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
                      smtpForm.provider === 'custom'
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
              {smtpForm.provider === 'gmail' && (
                <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-xl text-xs text-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-950 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-red-600" />
                      Requisito de Google: Contraseña de Aplicación de 16 caracteres
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowGmailGuide(!showGmailGuide)}
                      className="text-[11px] text-red-700 hover:underline font-semibold"
                    >
                      {showGmailGuide ? 'Ocultar guía' : '¿Cómo se genera? (3 pasos)'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Google no permite usar tu contraseña regular para envíos por seguridad. Se genera en 1 minuto:
                  </p>
                  {showGmailGuide && (
                    <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-700 leading-normal border-t border-red-200 pt-2">
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
                      <li>En <strong>Seguridad</strong>, verifica tener activada la <strong>Verificación en 2 pasos</strong>.</li>
                      <li>
                        Accede directo a:{' '}
                        <a
                          href="https://myaccount.google.com/apppasswords"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 underline font-semibold inline-flex items-center gap-0.5"
                        >
                          Contraseñas de aplicaciones <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </li>
                      <li>Escribe nombre <em>SafeWork</em> y haz clic en <strong>Crear</strong>.</li>
                      <li>Copia las <strong>16 letras</strong> que aparecen en fondo amarillo y pégalas abajo en el campo Contraseña.</li>
                    </ol>
                  )}
                </div>
              )}

              {/* SMTP Credentials Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Servidor SMTP (Host)
                  </label>
                  <input
                    type="text"
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Puerto (465 SSL o 587 TLS)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={smtpForm.port}
                      onChange={(e) =>
                        setSmtpForm({
                          ...smtpForm,
                          port: Number(e.target.value),
                          secure: Number(e.target.value) === 465,
                        })
                      }
                      className="w-24 px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smtpForm.secure}
                        onChange={(e) => setSmtpForm({ ...smtpForm, secure: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      Conexión segura SSL
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Tu Correo Remitente (Usuario) *
                  </label>
                  <input
                    type="email"
                    placeholder="usuario@gmail.com"
                    value={smtpForm.user}
                    onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    {smtpForm.provider === 'gmail'
                      ? 'Contraseña de Aplicación (16 letras) *'
                      : 'Contraseña del Correo *'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={smtpForm.pass}
                    onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              {/* Test Result Message */}
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

              {/* Save message */}
              {smtpSaveMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{smtpSaveMessage}</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleTestSmtp}
                  disabled={isTestingSmtp}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isTestingSmtp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      Verificando conexión...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Probar Conexión SMTP
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('send')}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSmtp}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Guardar y Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALTERNATIVE REAL DELIVERY CHANNELS */}
          {activeTab === 'alternatives' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                <strong className="text-slate-900 font-bold flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  Entrega Directa Inmediata (100% Efectiva)
                </strong>
                <p className="text-[11px] text-slate-600">
                  Si estás en el campo o necesitas entregar la hoja de inmediato al cliente sin configurar servidores, puedes usar cualquiera de estos canales oficiales:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp */}
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      Enviar por WhatsApp
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Abre un chat directo con el cliente ({ (isProforma ? proforma?.client.phone : report?.client.phone) || 'número del cliente' }) con el resumen oficial listo para enviar.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="mt-3 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Abrir WhatsApp
                  </button>
                </div>

                {/* Mobile Web Share */}
                <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      Compartir Archivo PDF (Móvil / Apps)
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      En teléfonos celulares y navegadores compatibles, comparte el archivo PDF oficial adjunto directamente por tu app de Gmail, Outlook, WhatsApp o AirDrop.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    disabled={isSharingPdf}
                    className="mt-3 w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    {isSharingPdf ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    Compartir PDF en Apps
                  </button>
                </div>

                {/* Gmail Web */}
                <div className="p-4 bg-red-50/50 border border-red-200 rounded-xl flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                      <Mail className="w-4 h-4 text-red-600" />
                      Redactar en Gmail Web
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Abre una pestaña en Gmail con el destinatario ({toEmail}), asunto y cuerpo pre-cargados para enviar desde tu cuenta personal o corporativa.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenGmailWeb}
                    className="mt-3 w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir en Gmail
                  </button>
                </div>

                {/* Outlook Web */}
                <div className="p-4 bg-sky-50/50 border border-sky-200 rounded-xl flex flex-col justify-between hover:shadow-xs transition-all">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sky-800 font-bold text-xs">
                      <Mail className="w-4 h-4 text-sky-600" />
                      Redactar en Outlook Web
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Abre Outlook Web en tu navegador con los campos listos para enviar a tu cliente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenOutlookWeb}
                    className="mt-3 w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir en Outlook
                  </button>
                </div>
              </div>

              {/* Direct PDF Download and Local Client */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-xs text-slate-600">
                  ¿Prefieres adjuntarlo tú mismo desde tu computadora?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenMailto}
                    className="text-xs text-slate-700 hover:text-blue-600 underline font-semibold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Gestor local
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadDirectPdf}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
