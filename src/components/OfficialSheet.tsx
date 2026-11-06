import React from 'react';
import { ServiceReport } from '../types';
import { Phone, Mail, User } from 'lucide-react';
import { SafeWorkLogo } from './SafeWorkLogo';

interface OfficialSheetProps {
  report: ServiceReport;
  onOpenSignatureModal?: (type: 'client' | 'technician') => void;
  readOnly?: boolean;
}

export const OfficialSheet: React.FC<OfficialSheetProps> = ({
  report,
  onOpenSignatureModal,
  readOnly = false,
}) => {
  return (
    <div
      id="official-sheet-container"
      className="w-full max-w-[850px] mx-auto bg-[#ffffff] text-[#000000] p-6 sm:p-8 font-sans text-xs border border-[#000000] print:border-none print:p-4 print:m-0"
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-[#000000]">
        {/* OFFICIAL LOGO */}
        <div className="flex items-center min-w-[170px] max-w-[210px] flex-shrink-0">
          {report.companyInfo?.logoUrl &&
          report.companyInfo.logoUrl !== '/safework-logo.png' &&
          (report.companyInfo.logoUrl.startsWith('data:') ||
            report.companyInfo.logoUrl.startsWith('http')) ? (
            <img
              src={report.companyInfo.logoUrl}
              alt="Safe Work Corporation"
              className="h-12 max-w-[190px] object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <SafeWorkLogo size="md" layout="horizontal" />
          )}
        </div>

        {/* HEADER TITLE */}
        <div className="flex-1 text-center px-2">
          <p className="text-[10.5px] sm:text-[11.5px] font-extrabold uppercase leading-snug tracking-tight text-[#0f172a]">
            DESCRIPCION DE LOS BIENES Y SERVICIOS A CONTRATAR SERVICIOS DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO PARA EQUIPOS INDUSTRIALES Y HOSPITALARIOS
          </p>
        </div>

        {/* HOJA DE SERVICIO BADGE */}
        <div className="w-[175px] flex-shrink-0">
          <div className="bg-[#1e88e5] text-[#ffffff] rounded-md p-1.5 text-center">
            <div className="text-[11px] font-black tracking-wider uppercase text-[#ffffff]">
              HOJA DE SERVICIO
            </div>
            <div className="text-[13px] font-bold font-mono tracking-widest text-[#cffafe]">
              {report.reportNumber || 'N·000000001'}
            </div>
          </div>
        </div>
      </div>

      {/* METADATA TABLE */}
      <table className="w-full border-collapse border border-[#000000] mt-2 text-[10px]">
        <tbody>
          <tr>
            <td className="border border-[#000000] font-bold uppercase p-1.5 bg-[#f8fafc] w-[25%] text-center">
              NÚMERO DE REPORTE
            </td>
            <td className="border border-[#000000] font-mono font-bold p-1.5 text-center w-[30%]">
              {report.reportNumber}
            </td>
            <td className="border border-[#000000] font-bold uppercase p-1.5 bg-[#f8fafc] text-center w-[15%]">
              FECHA
            </td>
            <td className="border border-[#000000] p-0 text-center w-[30%]">
              <div className="grid grid-cols-3 divide-x divide-[#000000] text-[9px] font-bold uppercase border-b border-[#000000] bg-[#f8fafc]">
                <span className="py-0.5">AAAA</span>
                <span className="py-0.5">MM</span>
                <span className="py-0.5">DD</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#000000] text-[10.5px] font-mono font-semibold py-0.5">
                <span>{report.date.year || '----'}</span>
                <span>{report.date.month || '--'}</span>
                <span>{report.date.day || '--'}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-[#000000] font-bold p-1.5 bg-[#f8fafc] text-right pr-2">
              Cliente:
            </td>
            <td className="border border-[#000000] p-1.5 font-semibold">
              {report.client.name || '—'}
            </td>
            <td className="border border-[#000000] font-bold p-1.5 bg-[#f8fafc] text-right pr-2">
              Dirección:
            </td>
            <td className="border border-[#000000] p-1.5 font-medium">
              {report.client.address || '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* INFORMACIÓN DEL EQUIPO */}
      <div className="mt-2 border border-[#000000]">
        <div className="bg-[#f1f5f9] border-b border-[#000000] font-extrabold uppercase text-center py-0.5 text-[10.5px] tracking-wide">
          INFORMACIÓN DEL EQUIPO
        </div>
        <table className="w-full border-collapse text-[10px]">
          <tbody>
            <tr className="border-b border-[#000000]">
              <td className="font-bold p-1.5 w-[22%] bg-[#f8fafc] border-r border-[#000000]">
                Nombre del equipo:
              </td>
              <td colSpan={3} className="p-1.5 uppercase font-semibold">
                {report.equipment.name || '—'}
              </td>
            </tr>
            <tr className="border-b border-[#000000]">
              <td className="font-bold p-1.5 bg-[#f8fafc] border-r border-[#000000]">
                Marca:
              </td>
              <td colSpan={3} className="p-1.5 uppercase font-semibold">
                {report.equipment.brand || '—'}
              </td>
            </tr>
            <tr className="border-b border-[#000000]">
              <td className="font-bold p-1.5 bg-[#f8fafc] border-r border-[#000000] align-top">
                Modelo :
              </td>
              <td className="p-1.5 border-r border-[#000000] font-medium align-top w-[38%]">
                <div className="whitespace-pre-line uppercase">
                  {report.equipment.model || '—'}
                </div>
              </td>
              <td className="p-0 border-r border-[#000000] align-top w-[25%]">
                <div className="border-b border-[#000000] p-1 bg-[#f8fafc] font-bold text-center">
                  Serie:
                </div>
                <div className="p-1 text-center font-mono font-medium whitespace-pre-line">
                  {report.equipment.series || '—'}
                </div>
              </td>
              <td className="p-0 align-top w-[15%]">
                <div className="border-b border-[#000000] p-1 bg-[#f8fafc] font-bold text-center">
                  Cantidad:
                </div>
                <div className="p-1 text-center font-bold text-[11px]">
                  {report.equipment.quantity || '1'}
                </div>
              </td>
            </tr>
            <tr>
              <td className="font-bold p-1.5 bg-[#f8fafc] border-r border-[#000000]">
                Área:
              </td>
              <td colSpan={3} className="p-1.5 uppercase font-medium">
                {report.equipment.area || '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* TIPO DE MANTENIMIENTO */}
      <div className="mt-2 border border-[#000000]">
        <div className="bg-[#f1f5f9] border-b border-[#000000] font-extrabold uppercase text-center py-0.5 text-[10px] tracking-wide">
          TIPO DE MANTENIMIENTO (marque con una x)
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#000000] text-[10px] text-center">
          <div className="p-1 flex items-center justify-between px-3">
            <span className="font-semibold">Mantenimiento Preventivo</span>
            <span className="w-5 h-5 border border-[#000000] flex items-center justify-center font-black text-xs bg-[#ffffff]">
              {report.maintenanceType === 'preventivo' ? 'X' : ''}
            </span>
          </div>
          <div className="p-1 flex items-center justify-between px-3">
            <span className="font-semibold">Mantenimiento Correctivo</span>
            <span className="w-5 h-5 border border-[#000000] flex items-center justify-center font-black text-xs bg-[#ffffff]">
              {report.maintenanceType === 'correctivo' ? 'X' : ''}
            </span>
          </div>
          <div className="p-1 flex items-center justify-between px-3">
            <span className="font-semibold">Verificación</span>
            <span className="w-5 h-5 border border-[#000000] flex items-center justify-center font-black text-xs bg-[#ffffff]">
              {report.maintenanceType === 'verificacion' ? 'X' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ESTADO DEL EQUIPO */}
      <div className="mt-2 border border-[#000000]">
        <div className="bg-[#f1f5f9] border-b border-[#000000] font-extrabold uppercase text-center py-0.5 text-[10px] tracking-wide">
          ESTADO DEL EQUIPO (marque con una x)
        </div>
        <div className="grid grid-cols-3 divide-x divide-[#000000] text-[10px]">
          <div className="p-1 flex items-center justify-between px-3">
            <span className="font-semibold">Funcional</span>
            <span className="w-5 h-5 border border-[#000000] flex items-center justify-center font-black text-xs bg-[#ffffff]">
              {report.equipmentStatus === 'funcional' ? 'X' : ''}
            </span>
          </div>
          <div className="p-1 flex items-center justify-between px-3">
            <span className="font-semibold">No enciende</span>
            <span className="w-5 h-5 border border-[#000000] flex items-center justify-center font-black text-xs bg-[#ffffff]">
              {report.equipmentStatus === 'no_enciende' ? 'X' : ''}
            </span>
          </div>
          <div className="p-1 flex items-center justify-between px-3">
            <span className="font-semibold truncate">
              Otro. ¿Cuál? {report.equipmentStatusOther ? `(${report.equipmentStatusOther})` : ''}
            </span>
            <span className="w-5 h-5 border border-[#000000] flex items-center justify-center font-black text-xs bg-[#ffffff] flex-shrink-0">
              {report.equipmentStatus === 'otro' ? 'X' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* VERIFICACIÓN DEL EQUIPO */}
      <div className="mt-2 border border-[#000000]">
        <div className="bg-[#f1f5f9] border-b border-[#000000] font-extrabold uppercase text-center py-0.5 text-[10px] tracking-wide">
          VERIFICACIÓN DEL EQUIPO (marque con una x)
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#000000] text-[10px]">
          {/* INSPECCIÓN EXTERNA */}
          <div>
            <div className="font-extrabold text-center py-1 border-b border-[#000000] bg-[#f8fafc]">
              INSPECCIÓN EXTERNA
            </div>
            <div className="grid grid-cols-4 divide-x divide-[#000000] text-center border-b border-[#000000] bg-[#f8fafc] font-bold">
              <span className="py-0.5">B</span>
              <span className="py-0.5">R</span>
              <span className="py-0.5">M</span>
              <span className="py-0.5">NA</span>
            </div>
            <div className="grid grid-cols-4 divide-x divide-[#000000] text-center font-black text-xs h-6 items-center">
              <span className="flex items-center justify-center">
                {report.verification.externalInspection === 'B' ? 'X' : ''}
              </span>
              <span className="flex items-center justify-center">
                {report.verification.externalInspection === 'R' ? 'X' : ''}
              </span>
              <span className="flex items-center justify-center">
                {report.verification.externalInspection === 'M' ? 'X' : ''}
              </span>
              <span className="flex items-center justify-center">
                {report.verification.externalInspection === 'NA' ? 'X' : ''}
              </span>
            </div>
          </div>

          {/* PRUEBAS DE FUNCIONAMIENTO */}
          <div>
            <div className="font-extrabold text-center py-1 border-b border-[#000000] bg-[#f8fafc]">
              PRUEBAS DE FUNCIONAMIENTO
            </div>
            <div className="grid grid-cols-4 divide-x divide-[#000000] text-center border-b border-[#000000] bg-[#f8fafc] font-bold">
              <span className="py-0.5">B</span>
              <span className="py-0.5">R</span>
              <span className="py-0.5">M</span>
              <span className="py-0.5">NA</span>
            </div>
            <div className="grid grid-cols-4 divide-x divide-[#000000] text-center font-black text-xs h-6 items-center">
              <span className="flex items-center justify-center">
                {report.verification.operatingTests === 'B' ? 'X' : ''}
              </span>
              <span className="flex items-center justify-center">
                {report.verification.operatingTests === 'R' ? 'X' : ''}
              </span>
              <span className="flex items-center justify-center">
                {report.verification.operatingTests === 'M' ? 'X' : ''}
              </span>
              <span className="flex items-center justify-center">
                {report.verification.operatingTests === 'NA' ? 'X' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Observaciones de verificación */}
        <div className="border-t border-[#000000] p-1.5 text-[10px]">
          <span className="font-bold">Observaciones: </span>
          <span className="font-medium text-[#1f2937]">
            {report.verification.notes || 'Sin novedades en la verificación preliminar.'}
          </span>
        </div>

        {/* Legend */}
        <div className="border-t border-[#000000] py-0.5 text-center text-[9px] font-bold bg-[#f8fafc]">
          B: Bueno / R: Regular / M: Malo / NA: No Aplica
        </div>
      </div>

      {/* TRABAJO(S) REALIZADO(S) */}
      <div className="mt-2 border border-[#000000]">
        <div className="bg-[#f1f5f9] border-b border-[#000000] font-extrabold uppercase text-center py-0.5 text-[10px] tracking-wide">
          TRABAJO(S) REALIZADO(S)
        </div>
        <div className="p-2 min-h-[50px] text-[10.5px] leading-relaxed whitespace-pre-line font-medium text-[#000000]">
          {report.workDone || '—'}
        </div>
      </div>

      {/* DETALLE DEL DIAGNÓSTICO */}
      <div className="mt-2 border border-[#000000]">
        <div className="bg-[#f1f5f9] border-b border-[#000000] font-extrabold uppercase text-center py-0.5 text-[10px] tracking-wide">
          DETALLE DEL DIAGNÓSTICO
        </div>
        <div className="p-2 min-h-[36px] text-[10px] leading-relaxed whitespace-pre-line font-medium text-[#000000]">
          {report.diagnosticDetail || '—'}
        </div>
      </div>

      {/* OBSERVACIONES O RECOMENDACIONES */}
      <div className="mt-2 border border-[#000000]">
        <div className="bg-[#f1f5f9] border-b border-[#000000] font-extrabold uppercase text-center py-0.5 text-[10px] tracking-wide">
          OBSERVACIONES O RECOMENDACIONES
        </div>
        <div className="p-2 min-h-[42px] text-[10px] leading-relaxed whitespace-pre-line font-medium text-[#000000]">
          {report.observations || '—'}
        </div>
      </div>

      {/* DIGITAL SIGNATURES SECTION */}
      <div className="mt-3 grid grid-cols-2 gap-4">
        {/* FIRMA CLIENTE */}
        <div
          onClick={() => !readOnly && onOpenSignatureModal && onOpenSignatureModal('client')}
          className={`border border-[#000000] p-2 min-h-[105px] flex flex-col justify-between bg-[#ffffff] ${
            !readOnly ? 'cursor-pointer hover:border-[#3b82f6] hover:bg-[#eff6ff] transition-all' : ''
          }`}
          title={!readOnly ? 'Clic para firmar digitalmente' : undefined}
        >
          <div className="font-extrabold text-[10.5px]">Firma de cliente:</div>
          <div className="flex-1 flex flex-col items-center justify-center my-1 relative">
            {report.clientSignature?.signatureDataUrl ? (
              <img
                src={report.clientSignature.signatureDataUrl}
                alt="Firma del cliente"
                className="max-h-16 object-contain"
              />
            ) : (
              <div className="text-[#9ca3af] italic text-[10px] py-3 text-center">
                {!readOnly ? '👉 Clic aquí para firmar con dedo / lápiz / mouse' : 'Sin firma'}
              </div>
            )}
            <div className="w-4/5 border-b border-[#000000] mt-1"></div>
          </div>
          <div className="text-center text-[9px] text-[#374151] leading-tight">
            <div className="font-bold uppercase">
              {report.clientSignature?.name || report.client.contactPerson || 'Nombre del Cliente'}
            </div>
            <div>
              {report.clientSignature?.idNumber ? `C.I.: ${report.clientSignature.idNumber}` : ''}{' '}
              {report.clientSignature?.role ? `• ${report.clientSignature.role}` : ''}
            </div>
            {report.clientSignature?.signedAt && (
              <div className="text-[8px] text-[#6b7280]">
                Firmado: {new Date(report.clientSignature.signedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* FIRMA TÉCNICO */}
        <div
          onClick={() => !readOnly && onOpenSignatureModal && onOpenSignatureModal('technician')}
          className={`border border-[#000000] p-2 min-h-[105px] flex flex-col justify-between bg-[#ffffff] ${
            !readOnly ? 'cursor-pointer hover:border-[#3b82f6] hover:bg-[#eff6ff] transition-all' : ''
          }`}
          title={!readOnly ? 'Clic para firmar digitalmente' : undefined}
        >
          <div className="font-extrabold text-[10.5px]">Firma de técnico:</div>
          <div className="flex-1 flex flex-col items-center justify-center my-1 relative">
            {report.technicianSignature?.signatureDataUrl ? (
              <img
                src={report.technicianSignature.signatureDataUrl}
                alt="Firma del técnico"
                className="max-h-16 object-contain"
              />
            ) : (
              <div className="text-[#9ca3af] italic text-[10px] py-3 text-center">
                {!readOnly ? '👉 Clic aquí para firmar con dedo / lápiz / mouse' : 'Sin firma'}
              </div>
            )}
            <div className="w-4/5 border-b border-[#000000] mt-1"></div>
          </div>
          <div className="text-center text-[9px] text-[#374151] leading-tight">
            <div className="font-bold uppercase">
              {report.technicianSignature?.name || report.companyInfo.technicianName}
            </div>
            <div>
              {report.technicianSignature?.idNumber ? `R.U.C./C.I.: ${report.technicianSignature.idNumber}` : ''}{' '}
              {report.technicianSignature?.role ? `• ${report.technicianSignature.role}` : ''}
            </div>
            {report.technicianSignature?.signedAt && (
              <div className="text-[8px] text-[#6b7280]">
                Firmado: {new Date(report.technicianSignature.signedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-4 pt-2 border-t-2 border-[#000000] text-[9px] text-[#1f2937]">
        <div className="flex flex-wrap items-center justify-between gap-2 font-semibold">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-[#334155]" />
            <span>{report.companyInfo.technicianName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-[#334155]" />
            <span>{report.companyInfo.technicianPhone}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-[#334155]" />
            <span>{report.companyInfo.technicianEmail}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 mt-1 pt-1 border-t border-[#e2e8f0] text-[#4b5563] text-[8.5px]">
          <div>{report.companyInfo.address}</div>
          <div className="font-bold text-[#000000]">{report.companyInfo.ruc}</div>
        </div>
      </div>
    </div>
  );
};
