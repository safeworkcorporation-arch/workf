import React from 'react';
import {
  Proforma,
  ProformaItem,
  ProformaItemCategory,
  ProformaStatus,
} from '../types';
import { recalculateProformaTotals } from '../utils/storage';
import {
  Plus,
  Trash2,
  Percent,
  DollarSign,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CreditCard,
  PenTool,
  Wrench,
  CheckCircle2,
  Sparkles,
  FileText,
  HelpCircle,
  Tag,
} from 'lucide-react';

interface ProformaFormProps {
  proforma: Proforma;
  onChange: (updated: Proforma) => void;
  onOpenSignatureModal?: (type: 'client' | 'technician') => void;
  onCreateNew?: () => void;
}

const PRESET_ITEMS: Array<{
  category: ProformaItemCategory;
  description: string;
  unitPrice: number;
}> = [
  {
    category: 'mano_de_obra',
    description: 'Mano de obra técnica calificada para diagnóstico, desmontaje, reparación y pruebas operativas.',
    unitPrice: 150.0,
  },
  {
    category: 'repuesto',
    description: 'Kit de empaquetaduras y sellos de alta temperatura originales.',
    unitPrice: 110.0,
  },
  {
    category: 'repuesto',
    description: 'Válvula solenoide para control de vapor y fluidos a alta presión.',
    unitPrice: 95.0,
  },
  {
    category: 'insumo',
    description: 'Filtro bacteriológico HEPA de 0.2 micras grado hospitalario.',
    unitPrice: 65.0,
  },
  {
    category: 'calibracion',
    description: 'Servicio de calibración metrológica y emisión de certificado de calibración en sitio.',
    unitPrice: 120.0,
  },
  {
    category: 'servicio',
    description: 'Mantenimiento preventivo programado según protocolo de fabricante.',
    unitPrice: 180.0,
  },
];

export const ProformaForm: React.FC<ProformaFormProps> = ({
  proforma,
  onChange,
  onOpenSignatureModal,
  onCreateNew,
}) => {
  // Recalculate totals helper
  const updateItemsAndTotals = (
    newItems: ProformaItem[],
    discountPct = proforma.discountPercentage,
    taxRt = proforma.taxRate
  ) => {
    const totals = recalculateProformaTotals(newItems, discountPct, taxRt);
    onChange({
      ...proforma,
      items: newItems,
      discountPercentage: discountPct,
      taxRate: taxRt,
      ...totals,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddItem = (preset?: {
    category: ProformaItemCategory;
    description: string;
    unitPrice: number;
    discountPercentage?: number;
  }) => {
    const newItem: ProformaItem = {
      id: `item-${Date.now()}-${proforma.items.length + 1}`,
      itemNumber: proforma.items.length + 1,
      category: preset?.category || 'servicio',
      description: preset?.description || '',
      quantity: 1,
      unitPrice: preset?.unitPrice || 50.0,
      discountPercentage: preset?.discountPercentage || 0,
      taxExempt: false,
      subtotal: preset?.unitPrice || 50.0,
    };

    const newItems = [...proforma.items, newItem];
    updateItemsAndTotals(newItems);
  };

  const handleRemoveItem = (id: string) => {
    const filtered = proforma.items.filter((item) => item.id !== id);
    // renumber
    const renumbered = filtered.map((item, index) => ({
      ...item,
      itemNumber: index + 1,
    }));
    updateItemsAndTotals(renumbered);
  };

  const handleItemChange = (
    id: string,
    field: keyof ProformaItem,
    value: any
  ) => {
    const updatedItems = proforma.items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const qty = Number(field === 'quantity' ? value : item.quantity) || 0;
        const price = Number(field === 'unitPrice' ? value : item.unitPrice) || 0;
        const discPct = Number(field === 'discountPercentage' ? value : item.discountPercentage) || 0;
        const gross = qty * price;
        const disc = (gross * discPct) / 100;
        updated.subtotal = Number((gross - disc).toFixed(2));
        return updated;
      }
      return item;
    });

    updateItemsAndTotals(updatedItems);
  };

  const handleValidityChange = (days: number) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + days);
    const expirationDate = `${baseDate.getFullYear()}-${String(
      baseDate.getMonth() + 1
    ).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`;

    onChange({
      ...proforma,
      validUntilDays: days,
      expirationDate,
      commercialTerms: {
        ...proforma.commercialTerms,
        validity: `${days} días calendario a partir de su emisión.`,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* TOP STATUS AND GENERAL INFO BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase bg-blue-50 text-blue-700 border border-blue-200/60 font-mono">
                {proforma.proformaNumber}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                Editor de Cotización / Proforma
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Crea o modifica la propuesta económica y alcance técnico para Safe Work Corporation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {onCreateNew && (
              <button
                type="button"
                onClick={onCreateNew}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-all transform active:scale-95"
                title="Crear una nueva proforma en blanco con correlativo automático"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nueva Proforma</span>
              </button>
            )}

            <label className="text-xs font-bold text-slate-600 uppercase ml-1">Estado:</label>
            <select
              value={proforma.status}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  status: e.target.value as ProformaStatus,
                  updatedAt: new Date().toISOString(),
                })
              }
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none ${
                proforma.status === 'aprobada'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : proforma.status === 'enviada'
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : proforma.status === 'rechazada'
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : proforma.status === 'facturada'
                  ? 'bg-purple-50 text-purple-700 border-purple-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <option value="borrador">📝 Borrador</option>
              <option value="enviada">✉️ Enviada al Cliente</option>
              <option value="aprobada">✅ Aprobada por Cliente</option>
              <option value="rechazada">❌ Rechazada / Vencida</option>
              <option value="facturada">💼 Facturada</option>
            </select>
          </div>
        </div>

        {/* DOCUMENT TYPE, NUMBER, DATES & FORMAT CONTROLS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Encabezado / Tipo Documento
            </label>
            <div className="flex gap-1">
              {['Factura', 'Proforma', 'Cotización'].map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => onChange({ ...proforma, documentTitle: title })}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    (proforma.documentTitle || 'Factura') === title
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              {proforma.documentTitle === 'Factura' ? 'N° de Factura' : 'N° de Proforma'}
            </label>
            <input
              type="text"
              value={proforma.proformaNumber}
              onChange={(e) =>
                onChange({ ...proforma, proformaNumber: e.target.value })
              }
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Fecha Emisión
            </label>
            <div className="grid grid-cols-3 gap-1">
              <input
                type="text"
                placeholder="DD"
                maxLength={2}
                value={proforma.date.day}
                onChange={(e) =>
                  onChange({
                    ...proforma,
                    date: { ...proforma.date, day: e.target.value },
                  })
                }
                className="px-2 py-2 text-center text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="MM"
                maxLength={2}
                value={proforma.date.month}
                onChange={(e) =>
                  onChange({
                    ...proforma,
                    date: { ...proforma.date, month: e.target.value },
                  })
                }
                className="px-2 py-2 text-center text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                placeholder="AAAA"
                maxLength={4}
                value={proforma.date.year}
                onChange={(e) =>
                  onChange({
                    ...proforma,
                    date: { ...proforma.date, year: e.target.value },
                  })
                }
                className="px-2 py-2 text-center text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Fecha Vencimiento
            </label>
            <input
              type="date"
              value={proforma.expirationDate}
              onChange={(e) =>
                onChange({ ...proforma, expirationDate: e.target.value })
              }
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Fecha de Entrega
            </label>
            <input
              type="date"
              value={proforma.deliveryDate || `${proforma.date.year}-${String(proforma.date.month).padStart(2, '0')}-${String(proforma.date.day).padStart(2, '0')}`}
              onChange={(e) =>
                onChange({ ...proforma, deliveryDate: e.target.value })
              }
              className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* SECTION: CLIENT INFORMATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
          <Building2 className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Datos del Cliente / Empresa
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Razón Social / Nombre del Cliente *
            </label>
            <input
              type="text"
              value={proforma.client.name}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  client: { ...proforma.client, name: e.target.value },
                })
              }
              placeholder="Ej: Solca Núcleo de Manabí / Clínica San Gregorio"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              RUC o Cédula de Identidad *
            </label>
            <input
              type="text"
              value={proforma.client.rucOrCi}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  client: { ...proforma.client, rucOrCi: e.target.value },
                })
              }
              placeholder="1390038890001"
              className="w-full px-3 py-2 text-xs font-mono font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={proforma.client.address}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  client: { ...proforma.client, address: e.target.value },
                })
              }
              placeholder="Av. Universitaria y Reales Tamarindos"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Ciudad
            </label>
            <input
              type="text"
              value={proforma.client.city || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  client: { ...proforma.client, city: e.target.value },
                })
              }
              placeholder="PORTOVIEJO"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              País
            </label>
            <input
              type="text"
              value={proforma.client.country || 'Ecuador'}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  client: { ...proforma.client, country: e.target.value },
                })
              }
              placeholder="Ecuador"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Formato Decimal
            </label>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...proforma,
                  useCommaDecimal: proforma.useCommaDecimal === false ? true : false,
                })
              }
              className={`w-full py-2 px-3 text-xs font-bold rounded-lg border text-center transition-colors ${
                proforma.useCommaDecimal !== false
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              {proforma.useCommaDecimal !== false ? 'Coma: $90,18 (Ecuador)' : 'Punto: $90.18'}
            </button>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Atención / Contacto
            </label>
            <input
              type="text"
              value={proforma.client.contactPerson || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  client: { ...proforma.client, contactPerson: e.target.value },
                })
              }
              placeholder="Ing. Carlos Mendoza (Jefe Mantenimiento)"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Teléfono / Celular
            </label>
            <input
              type="text"
              value={proforma.client.phone || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  client: { ...proforma.client, phone: e.target.value },
                })
              }
              placeholder="052-635555 / 0991182698"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={proforma.client.email || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  client: { ...proforma.client, email: e.target.value },
                })
              }
              placeholder="compras@empresa.com"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION: EQUIPMENT REFERENCE & ASSOCIATED SERVICE REPORT */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Referencia Técnica del Equipo (Opcional)
            </h3>
          </div>
          {proforma.relatedServiceReportNumber && (
            <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
              Derivada de Hoja: {proforma.relatedServiceReportNumber}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Nombre del Equipo
            </label>
            <input
              type="text"
              value={proforma.equipmentRef?.name || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  equipmentRef: {
                    name: e.target.value,
                    brand: proforma.equipmentRef?.brand || '',
                    model: proforma.equipmentRef?.model || '',
                    series: proforma.equipmentRef?.series || '',
                    locationOrArea: proforma.equipmentRef?.locationOrArea || '',
                  },
                })
              }
              placeholder="Lavadora Industrial / Autoclave"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Marca
            </label>
            <input
              type="text"
              value={proforma.equipmentRef?.brand || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  equipmentRef: {
                    name: proforma.equipmentRef?.name || '',
                    brand: e.target.value,
                    model: proforma.equipmentRef?.model || '',
                    series: proforma.equipmentRef?.series || '',
                    locationOrArea: proforma.equipmentRef?.locationOrArea || '',
                  },
                })
              }
              placeholder="DOMUS / Steris"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Modelo / Serie
            </label>
            <input
              type="text"
              value={proforma.equipmentRef?.model || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  equipmentRef: {
                    name: proforma.equipmentRef?.name || '',
                    brand: proforma.equipmentRef?.brand || '',
                    model: e.target.value,
                    series: proforma.equipmentRef?.series || '',
                    locationOrArea: proforma.equipmentRef?.locationOrArea || '',
                  },
                })
              }
              placeholder="DLS-27 / S/N 8941"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Área o Ubicación
            </label>
            <input
              type="text"
              value={proforma.equipmentRef?.locationOrArea || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  equipmentRef: {
                    name: proforma.equipmentRef?.name || '',
                    brand: proforma.equipmentRef?.brand || '',
                    model: proforma.equipmentRef?.model || '',
                    series: proforma.equipmentRef?.series || '',
                    locationOrArea: e.target.value,
                  },
                })
              }
              placeholder="Lavandería / Quirófano"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* SECTION: ITEMS & SCOPE OF WORK TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Detalle de Servicios, Repuestos y Mano de Obra
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Agrega los ítems que conforman la propuesta económica.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleAddItem()}
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Ítem
          </button>
        </div>

        {/* QUICK PRESETS CHIPS */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Plantillas Rápidas para Agregar con 1 Click:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_ITEMS.map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleAddItem(preset)}
                className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-300 hover:border-blue-300 rounded-lg transition-all"
              >
                + {preset.category === 'repuesto' ? '🔧 ' : preset.category === 'mano_de_obra' ? '👷 ' : '📄 '}
                {preset.description.slice(0, 36)}... (${preset.unitPrice})
              </button>
            ))}
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-3">
          {proforma.items.map((item, idx) => {
            const subtotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
            return (
              <div
                key={item.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <select
                      value={item.category}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          'category',
                          e.target.value as ProformaItemCategory
                        )
                      }
                      className="text-xs font-bold px-2 py-1 bg-slate-50 border border-slate-200 rounded-md uppercase"
                    >
                      <option value="mano_de_obra">👷 Mano de Obra</option>
                      <option value="repuesto">🔧 Repuesto</option>
                      <option value="insumo">📦 Insumo / Material</option>
                      <option value="servicio">⚙️ Servicio Integral</option>
                      <option value="calibracion">📐 Calibración</option>
                      <option value="otro">📄 Otro</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Eliminar ítem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* DESCRIPTION */}
                  <div className="sm:col-span-5">
                    <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                      Descripción Detallada / Alcance
                    </label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(item.id, 'description', e.target.value)
                      }
                      placeholder="Detalle del trabajo técnico, especificaciones del repuesto, marca o protocolo..."
                      className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                    />
                  </div>

                  {/* QUANTITY */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(item.id, 'quantity', e.target.value)
                      }
                      className="w-full px-3 py-2 text-xs font-mono font-bold text-center border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* UNIT PRICE */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                      Precio Unit. ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, 'unitPrice', e.target.value)
                        }
                        className="w-full pl-6 pr-2 py-2 text-xs font-mono font-bold border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* DISCOUNT PERCENTAGE */}
                  <div className="sm:col-span-1">
                    <label className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                      Desc. %
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discountPercentage ?? ''}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          'discountPercentage',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                      className="w-full px-1.5 py-2 text-xs font-mono font-bold text-center border border-slate-200 rounded-lg"
                    />
                  </div>

                  {/* ITEM TOTAL & TAX EXEMPT */}
                  <div className="sm:col-span-2 flex flex-col justify-between">
                    <div>
                      <span className="block text-[10.5px] font-bold text-slate-600 uppercase mb-1">
                        Importe ($)
                      </span>
                      <div className="text-sm font-mono font-black text-slate-900">
                        ${(Number(item.subtotal) || 0).toFixed(2)}
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer mt-1 text-[10.5px] text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={item.taxExempt || false}
                        onChange={(e) =>
                          handleItemChange(item.id, 'taxExempt', e.target.checked)
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span>Tarifa 0% IVA</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: FINANCIAL TOTALS & TAXES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* ADJUSTMENTS (DISCOUNT & TAX RATE) */}
          <div className="sm:col-span-7 space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Descuentos y Tasa de Impuesto
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Descuento Comercial (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={proforma.discountPercentage}
                    onChange={(e) =>
                      updateItemsAndTotals(
                        proforma.items,
                        Number(e.target.value) || 0,
                        proforma.taxRate
                      )
                    }
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-lg pr-7"
                  />
                  <Percent className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  I.V.A. (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={proforma.taxRate}
                    onChange={(e) =>
                      updateItemsAndTotals(
                        proforma.items,
                        proforma.discountPercentage,
                        Number(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-200 rounded-lg pr-7"
                  />
                  <span className="text-xs text-slate-400 font-bold absolute right-2.5 top-2.5">%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Tarifa vigente en Ecuador: 15%</p>
              </div>
            </div>
          </div>

          {/* TOTALS SUMMARY CARD */}
          <div className="sm:col-span-5 bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between shadow-md">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Tarifa 0%:</span>
                <span className="font-mono">${Number(proforma.subtotalZero || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Subtotal Gravado ({proforma.taxRate}%):</span>
                <span className="font-mono">${Number(proforma.subtotalTaxed || 0).toFixed(2)}</span>
              </div>
              {Number(proforma.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuento ({proforma.discountPercentage}%):</span>
                  <span className="font-mono">-${Number(proforma.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>I.V.A. ({proforma.taxRate}%):</span>
                <span className="font-mono">${Number(proforma.taxAmount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 mt-3 flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Propuesta:
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-400 font-mono">
                  ${Number(proforma.total || 0).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase">
                  {proforma.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: COMMERCIAL TERMS AND BANKING INFO */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Condiciones Comerciales y Cuentas Bancarias
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Tiempo de Entrega
            </label>
            <input
              type="text"
              value={proforma.commercialTerms.deliveryTime}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  commercialTerms: {
                    ...proforma.commercialTerms,
                    deliveryTime: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                'Inmediato',
                '24 a 48 horas',
                '3 a 5 días hábiles',
                '8 a 10 días',
              ].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...proforma,
                      commercialTerms: {
                        ...proforma.commercialTerms,
                        deliveryTime: `${val} tras confirmación de orden.`,
                      },
                    })
                  }
                  className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Forma de Pago (En su totalidad)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                100% Totalidad
              </span>
            </label>
            <input
              type="text"
              value={proforma.commercialTerms.paymentMethod}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  commercialTerms: {
                    ...proforma.commercialTerms,
                    paymentMethod: e.target.value,
                  },
                })
              }
              placeholder="En su totalidad (100% al momento de la entrega / orden)"
              className="w-full px-3 py-2 text-xs font-semibold border-2 border-blue-200 rounded-lg bg-blue-50/20 text-slate-900 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                'En su totalidad (100% al momento de la entrega / orden)',
                'En su totalidad (100% contra entrega)',
                'En su totalidad (100% anticipado)',
                'En su totalidad mediante transferencia bancaria',
                'En su totalidad al recibir el equipo a entera satisfacción',
              ].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...proforma,
                      commercialTerms: {
                        ...proforma.commercialTerms,
                        paymentMethod: val,
                      },
                    })
                  }
                  className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                    proforma.commercialTerms.paymentMethod === val
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-slate-700'
                  }`}
                >
                  ✓ {val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Garantía Técnica
            </label>
            <input
              type="text"
              value={proforma.commercialTerms.warranty}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  commercialTerms: {
                    ...proforma.commercialTerms,
                    warranty: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['30 días', '90 días en repuestos y 60 en mano de obra', '6 meses', '1 año'].map(
                (val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...proforma,
                        commercialTerms: {
                          ...proforma.commercialTerms,
                          warranty: val,
                        },
                      })
                    }
                    className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 rounded text-slate-700"
                  >
                    {val}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Texto de Validez
            </label>
            <input
              type="text"
              value={proforma.commercialTerms.validity}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  commercialTerms: {
                    ...proforma.commercialTerms,
                    validity: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Datos Bancarios para Transferencia / Depósito
            </label>
            <input
              type="text"
              value={proforma.commercialTerms.bankingDetails}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  commercialTerms: {
                    ...proforma.commercialTerms,
                    bankingDetails: e.target.value,
                  },
                })
              }
              placeholder="Banco Pichincha | Cta. Corriente | Safe Work Corporation..."
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Observaciones / Notas Adicionales
            </label>
            <textarea
              rows={2}
              value={proforma.commercialTerms.notes || ''}
              onChange={(e) =>
                onChange({
                  ...proforma,
                  commercialTerms: {
                    ...proforma.commercialTerms,
                    notes: e.target.value,
                  },
                })
              }
              placeholder="Notas sobre instalación, exclusiones o vigencia..."
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
