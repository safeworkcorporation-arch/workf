import React, { useRef } from 'react';
import { Proforma } from '../types';
import { SafeWorkLogo } from './SafeWorkLogo';
import { User, Phone, Mail, PenTool, Laptop, Upload } from 'lucide-react';

interface OfficialProformaSheetProps {
  proforma: Proforma;
  onOpenSignatureModal?: (type: 'client' | 'technician') => void;
  readOnly?: boolean;
  onUploadLogo?: (fileDataUrl: string) => void;
  onOpenSettings?: () => void;
}

export const OfficialProformaSheet: React.FC<OfficialProformaSheetProps> = ({
  proforma,
  onOpenSignatureModal,
  readOnly = false,
  onUploadLogo,
  onOpenSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const useComma = proforma.useCommaDecimal !== false;

  // Format currency numbers: e.g. 90.18 -> "$90,18" or "$90.18"
  const formatMoney = (val: number | string | undefined): string => {
    const num = Number(val || 0);
    const fixed = num.toFixed(2);
    return `$${useComma ? fixed.replace('.', ',') : fixed}`;
  };

  // Format decimal numbers: e.g. 130 -> "130,00"
  const formatNumber = (val: number | string | undefined, decimals = 2): string => {
    const num = Number(val || 0);
    const fixed = num.toFixed(decimals);
    return useComma ? fixed.replace('.', ',') : fixed;
  };

  // Format date to D/M/YYYY (e.g. 13/5/2026)
  const formatDateDMY = (
    dateInput?: { year: string; month: string; day: string } | string
  ): string => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string') {
      const parts = dateInput.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}/${parts[0]}`;
        }
        // DD/MM/YYYY
        return `${parseInt(parts[0], 10)}/${parseInt(parts[1], 10)}/${parts[2]}`;
      }
      return dateInput;
    }
    const day = parseInt(dateInput.day, 10) || 1;
    const month = parseInt(dateInput.month, 10) || 1;
    const year = dateInput.year || new Date().getFullYear();
    return `${day}/${month}/${year}`;
  };

  const docTitle = proforma.documentTitle || 'Factura';
  const docNumber = proforma.proformaNumber || '096';
  const issueDateFormatted = formatDateDMY(proforma.date);
  const expirationDateFormatted = formatDateDMY(proforma.expirationDate);
  const deliveryDateFormatted = formatDateDMY(proforma.deliveryDate || proforma.date);

  const company = proforma.companyInfo || {
    companyName: 's.w.corporation',
    address: 'sitio los Angeles s/n',
    postalCode: '130112',
    cityCountry: 'PORTOVIEJO, Ecuador',
    ruc: '1308013182001',
    technicianName: 'ING. Eduardo Marin',
    technicianPhone: '0991182698',
    technicianEmail: 's.w.service0012@hotmail.com',
  };

  const hasSignatures =
    Boolean(proforma.technicianSignature?.signatureDataUrl) ||
    Boolean(proforma.clientSignature?.signatureDataUrl);

  return (
    <div
      id="official-proforma-container"
      className="w-full max-w-[850px] mx-auto bg-white text-black p-8 sm:p-12 font-sans text-xs border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-6 print:m-0 flex flex-col justify-between"
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        minHeight: '1100px',
      }}
    >
      {/* TOP SECTION */}
      <div>
        {/* HEADER: TITLE ON LEFT, LOGO ON RIGHT */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal text-black tracking-tight">
              {docTitle}
            </h1>
            <p className="text-[11px] text-[#6b7280] mt-7 mb-6 font-normal">
              s.w.corporation, sitio los Angeles s/n, 130112 PORTOVIEJO, Ecuador
            </p>
          </div>

          <div className="flex flex-col items-center relative group">
            {!readOnly && onUploadLogo && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (typeof ev.target?.result === 'string') {
                          onUploadLogo(ev.target.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Haz clic para subir el logo directamente desde tu PC"
                  className="hidden group-hover:flex items-center gap-1 absolute -top-3 right-0 px-2 py-0.5 text-[9.5px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-md cursor-pointer print:hidden transition-all z-10 whitespace-nowrap"
                >
                  <Laptop className="w-2.5 h-2.5" />
                  Subir Logo (PC)
                </button>
              </>
            )}
            {company.logoUrl &&
            company.logoUrl !== '/safework-logo.png' &&
            (company.logoUrl.startsWith('data:') || company.logoUrl.startsWith('http')) ? (
              <img
                src={company.logoUrl}
                alt="Safe Work Corporation"
                className="h-16 max-w-[150px] object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <SafeWorkLogo size="md" layout="vertical" />
            )}
          </div>
        </div>

        {/* METADATA: PARA (CLIENT) ON LEFT, DETAILS ON RIGHT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          {/* CLIENT BLOCK (PARA) */}
          <div className="text-[11px] text-black leading-snug space-y-0.5">
            <div className="font-bold text-[11.5px] uppercase text-black mb-1">
              PARA
            </div>
            <div className="font-normal">{proforma.client.name || 'Sociedad de lucha contra el cáncer de Manabí'}</div>
            {proforma.client.rucOrCi && (
              <div>RUC: {proforma.client.rucOrCi}</div>
            )}
            {proforma.client.address && (
              <div>{proforma.client.address}</div>
            )}
            {proforma.client.city && (
              <div className="uppercase">{proforma.client.city}</div>
            )}
            <div>{proforma.client.country || 'Ecuador'}</div>
          </div>

          {/* DATES & NUMBER BLOCK (RIGHT ALIGNED) */}
          <div className="flex justify-start sm:justify-end">
            <table className="text-[11px] text-black">
              <tbody>
                <tr>
                  <td className="pr-6 py-0.5 text-left text-slate-800">
                    {docTitle === 'Factura' ? 'N° de factura:' : 'N° de proforma:'}
                  </td>
                  <td className="py-0.5 text-right font-bold font-sans">
                    {docNumber}
                  </td>
                </tr>
                <tr>
                  <td className="pr-6 py-0.5 text-left text-slate-800">Fecha:</td>
                  <td className="py-0.5 text-right font-bold">
                    {issueDateFormatted}
                  </td>
                </tr>
                <tr>
                  <td className="pr-6 py-0.5 text-left text-slate-800">Vencimiento:</td>
                  <td className="py-0.5 text-right font-bold">
                    {expirationDateFormatted}
                  </td>
                </tr>
                {deliveryDateFormatted && (
                  <tr>
                    <td className="pr-6 pt-2 py-0.5 text-left text-slate-800">
                      Fecha de entrega:
                    </td>
                    <td className="pt-2 py-0.5 text-right font-bold">
                      {deliveryDateFormatted}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BLUE BANNER */}
        <div
          className="mt-6 text-white grid grid-cols-2 sm:grid-cols-4 px-4 py-2.5 items-center"
          style={{ backgroundColor: '#004ce8' }}
        >
          {/* COL 1: NUMBER */}
          <div className="py-1 sm:border-r border-white/25 pr-2">
            <div className="text-[10.5px] text-white/90 leading-tight">
              {docTitle === 'Factura' ? 'N° de factura' : 'N° de proforma'}
            </div>
            <div className="text-[17px] font-bold text-white tracking-tight mt-0.5">
              {docNumber}
            </div>
          </div>

          {/* COL 2: EMISSION DATE */}
          <div className="py-1 sm:border-r border-white/25 sm:px-3">
            <div className="text-[10.5px] text-white/90 leading-tight">
              Fecha de emisión
            </div>
            <div className="text-[15px] font-semibold text-white mt-0.5">
              {issueDateFormatted}
            </div>
          </div>

          {/* COL 3: EXPIRATION DATE */}
          <div className="py-1 sm:border-r border-white/25 sm:px-3">
            <div className="text-[10.5px] text-white/90 leading-tight">
              Vencimiento
            </div>
            <div className="text-[15px] font-semibold text-white mt-0.5">
              {expirationDateFormatted}
            </div>
          </div>

          {/* COL 4: TOTAL TO PAY */}
          <div className="py-1 sm:pl-3">
            <div className="text-[10.5px] text-white/90 leading-tight">
              Total a pagar (USD)
            </div>
            <div className="text-[17px] font-bold text-white tracking-tight mt-0.5">
              {formatMoney(proforma.total)}
            </div>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mt-6">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-t border-b border-black text-black font-bold">
                <th className="py-2 text-left font-bold w-[45%]">Descripción</th>
                <th className="py-2 text-center font-bold w-[12%]">Cantidad</th>
                <th className="py-2 text-right font-bold w-[14%]">Precio ($)</th>
                <th className="py-2 text-right font-bold w-[14%]">Descuento %</th>
                <th className="py-2 text-right font-bold w-[15%]">Importe ($)</th>
              </tr>
            </thead>
            <tbody>
              {proforma.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    No hay ítems registrados.
                  </td>
                </tr>
              ) : (
                proforma.items.map((item, index) => {
                  const qty = Number(item.quantity) || 0;
                  const price = Number(item.unitPrice) || 0;
                  const discountPct = Number(item.discountPercentage) || 0;
                  const gross = qty * price;
                  const discountAmount = (gross * discountPct) / 100;
                  const lineTotal = gross - discountAmount;

                  return (
                    <tr key={item.id || index} className="text-black">
                      <td className="py-2.5 pr-2 text-left align-top leading-snug">
                        {item.description}
                      </td>
                      <td className="py-2.5 px-2 text-center align-top font-medium">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-2 text-right align-top font-medium">
                        {formatNumber(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-2 text-right align-top font-medium">
                        {discountPct > 0 ? formatNumber(discountPct) : '0,00'}
                      </td>
                      <td className="py-2.5 pl-2 text-right align-top font-medium">
                        {formatNumber(lineTotal)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="border-b border-black w-full" />
        </div>

        {/* SUBTOTALS AND TOTALS */}
        <div className="flex justify-end mt-3">
          <table className="text-[11px] text-black">
            <tbody>
              <tr>
                <td className="py-1 pr-12 text-left font-normal text-slate-900">
                  Subtotal:
                </td>
                <td className="py-1 text-right font-normal">
                  {formatMoney(proforma.subtotalGeneral || proforma.total)}
                </td>
              </tr>
              {Number(proforma.discountAmount || 0) > 0 &&
                Number(proforma.discountPercentage || 0) > 0 && (
                  <tr>
                    <td className="py-1 pr-12 text-left font-normal text-slate-900">
                      Descuento adicional ({proforma.discountPercentage}%):
                    </td>
                    <td className="py-1 text-right font-normal">
                      -{formatMoney(proforma.discountAmount)}
                    </td>
                  </tr>
                )}
              {Number(proforma.taxRate || 0) > 0 && Number(proforma.taxAmount || 0) > 0 && (
                <tr>
                  <td className="py-1 pr-12 text-left font-normal text-slate-900">
                    I.V.A. ({proforma.taxRate}%):
                  </td>
                  <td className="py-1 text-right font-normal">
                    {formatMoney(proforma.taxAmount)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-1.5 pr-12 text-left font-bold text-black text-[12px]">
                  Total (USD):
                </td>
                <td className="py-1.5 text-right font-bold text-black text-[12px]">
                  {formatMoney(proforma.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* COMMERCIAL CONDITIONS & NOTES (IF ANY) */}
        {(proforma.commercialTerms?.notes ||
          proforma.equipmentRef?.name ||
          proforma.commercialTerms?.paymentMethod) && (
          <div className="mt-6 pt-4 border-t border-slate-200 text-[10px] text-slate-600">
            {proforma.equipmentRef?.name && (
              <p className="mb-1">
                <strong>Referencia de Equipo:</strong> {proforma.equipmentRef.name}{' '}
                {proforma.equipmentRef.brand ? `(${proforma.equipmentRef.brand} ${proforma.equipmentRef.model || ''})` : ''}
                {proforma.equipmentRef.series ? ` • S/N: ${proforma.equipmentRef.series}` : ''}
              </p>
            )}
            {proforma.commercialTerms?.deliveryTime && (
              <p className="mb-0.5">
                <strong>Tiempo de entrega:</strong> {proforma.commercialTerms.deliveryTime}
              </p>
            )}
            {proforma.commercialTerms?.paymentMethod ? (
              <p className="mb-0.5">
                <strong>Forma de pago:</strong>{' '}
                <span className="font-bold text-black uppercase">
                  {proforma.commercialTerms.paymentMethod}
                </span>
              </p>
            ) : (
              <p className="mb-0.5">
                <strong>Forma de pago:</strong>{' '}
                <span className="font-bold text-black uppercase">
                  En su totalidad (100% al momento de la entrega / orden)
                </span>
              </p>
            )}
            {proforma.commercialTerms?.bankingDetails && (
              <p className="mb-0.5">
                <strong>Datos bancarios:</strong> {proforma.commercialTerms.bankingDetails}
              </p>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: OFFICIAL FOOTER & OPTIONAL SIGNATURES IF SIGNED */}
      <div className="mt-10">
        {/* SIGNATURES ROW (ONLY IF SIGNED) */}
        {hasSignatures && (
          <div className="grid grid-cols-2 gap-8 mb-6 pt-2">
            {/* SAFE WORK SIGNATURE */}
            <div className="text-center">
              <div className="h-14 flex items-center justify-center">
                {proforma.technicianSignature?.signatureDataUrl ? (
                  <img
                    src={proforma.technicianSignature.signatureDataUrl}
                    alt="Firma Emisor"
                    className="max-h-12 max-w-[180px] object-contain"
                  />
                ) : (
                  !readOnly && (
                    <button
                      type="button"
                      onClick={() => onOpenSignatureModal?.('technician')}
                      className="text-[9px] text-blue-600 border border-dashed border-blue-400 px-2 py-1 rounded-xs hover:bg-blue-50 transition-colors"
                    >
                      <PenTool className="w-3 h-3 inline mr-1" />
                      Firma Emisor Safe Work
                    </button>
                  )
                )}
              </div>
              <div className="border-t border-slate-400 pt-1 text-[9.5px]">
                <div className="font-bold text-black uppercase">
                  {proforma.technicianSignature?.name || company.technicianName || 'ING. Eduardo Marin'}
                </div>
                <div className="text-slate-600 text-[8.5px]">
                  Firma Autorizada • Safe Work Corporation
                </div>
              </div>
            </div>

            {/* CLIENT SIGNATURE */}
            <div className="text-center">
              <div className="h-14 flex items-center justify-center">
                {proforma.clientSignature?.signatureDataUrl ? (
                  <img
                    src={proforma.clientSignature.signatureDataUrl}
                    alt="Firma Cliente"
                    className="max-h-12 max-w-[180px] object-contain"
                  />
                ) : (
                  !readOnly && (
                    <button
                      type="button"
                      onClick={() => onOpenSignatureModal?.('client')}
                      className="text-[9px] text-slate-600 border border-dashed border-slate-400 px-2 py-1 rounded-xs hover:bg-slate-50 transition-colors"
                    >
                      <PenTool className="w-3 h-3 inline mr-1" />
                      Firma / Aceptación Cliente
                    </button>
                  )
                )}
              </div>
              <div className="border-t border-slate-400 pt-1 text-[9.5px]">
                <div className="font-bold text-black uppercase">
                  {proforma.clientSignature?.name || proforma.client.name || 'Cliente / Aceptación'}
                </div>
                <div className="text-slate-600 text-[8.5px]">
                  Aceptación de Oferta Comercial
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER BARS: MATCHING EXACT IMAGE FORMAT */}
        <div className="border-t border-black pt-2">
          {/* ICONS ROW */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-black pb-2">
            <div className="flex items-center gap-1.5 font-normal">
              <User className="w-3.5 h-3.5 fill-black text-black" />
              <span>{company.technicianName || 'ING. Eduardo Marin'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-normal">
              <Phone className="w-3.5 h-3.5 fill-black text-black" />
              <span>{company.technicianPhone || '0991182698'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-normal">
              <Mail className="w-3.5 h-3.5 text-black" />
              <span>{company.technicianEmail || 's.w.service0012@hotmail.com'}</span>
            </div>
          </div>

          {/* TWO COLUMN ADDRESS & BUSINESS ID */}
          <div className="flex flex-wrap items-start justify-between text-[10.5px] text-black pt-1 leading-snug">
            <div className="text-left font-normal space-y-0.2">
              <div>s.w.corporation</div>
              <div>sitio los Angeles s/n</div>
              <div>130112 PORTOVIEJO</div>
              <div>Ecuador</div>
            </div>
            <div className="text-right font-normal">
              Business ID: R.U.C. {company.ruc || '1308013182001'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
