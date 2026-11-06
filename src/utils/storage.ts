import { ServiceReport, CompanySettings, Proforma, ProformaItem } from '../types';

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'SAFE WORK CORPORATION',
  subtitle:
    'DESCRIPCIÓN DE LOS BIENES Y SERVICIOS A CONTRATAR SERVICIOS DE MANTENIMIENTO PREVENTIVO Y CORRECTIVO PARA EQUIPOS INDUSTRIALES Y HOSPITALARIOS',
  logoUrl: '/safework-logo.png',
  technicianName: 'ING. Eduardo Marín',
  technicianTitle: 'Ingeniero de Mantenimiento',
  technicianPhone: '0991182698',
  technicianEmail: 's.w.service0012@hotmail.com',
  address: 's.w.corporation | sitio los Ángeles s/n | 130112 PORTOVIEJO | Ecuador',
  cityCountry: 'Portoviejo, Ecuador',
  ruc: '1308013182001',
  defaultEmailCC: 's.w.service0012@hotmail.com, sep9175@gmail.com',
  defaultPaymentMethod: 'En su totalidad (100% al momento de la entrega / orden)',
  defaultDeliveryTime: 'Inmediata / En sitio tras confirmación',
  defaultValidityDays: 30,
  defaultDocumentTitle: 'Factura',
  defaultBankingDetails: 'Banco Pichincha | Cta. Corriente | Safe Work Corporation | R.U.C. 1308013182001',
  defaultNotes: 's.w.corporation, sitio los Angeles s/n, 130112 PORTOVIEJO, Ecuador',
};

export const SAMPLE_REPORT: ServiceReport = {
  id: 'rep-000000001',
  reportNumber: 'N·000000001',
  date: {
    year: '2025',
    month: '12',
    day: '22',
  },
  client: {
    name: 'Solca Portoviejo',
    address: 'Autopista del Valle Manabí Guillén',
    phone: '052-635555',
    email: 'mantenimiento@solcaportoviejo.med.ec',
    contactPerson: 'Ing. Administrador de Lavandería',
  },
  equipment: {
    name: 'LABADORA INDUSTRIAL',
    brand: 'DOMUS',
    model: 'DOMUS DLS 27 TOUCH E - DOMUSDLS36 TOUCH E',
    series: 'DLS-27\nDLS-36',
    quantity: '2',
    area: 'Lavandería',
  },
  maintenanceType: 'preventivo',
  equipmentStatus: 'funcional',
  equipmentStatusOther: '',
  verification: {
    externalInspection: 'B',
    operatingTests: 'B',
    notes: 'Equipos limpios, sin vibraciones anómalas en centrifugado.',
  },
  workDone:
    'Limpieza de Tambor - Filtros y Sistema de Desagüe - Sistema Eléctrico - Fuente de Alimentación - Motor Rotatorio - Sistemas de Engranajes',
  diagnosticDetail: 'Diagnóstico general satisfactorio. Parámetros de voltaje y amperaje dentro de tolerancias de fábrica.',
  observations:
    'Los mantenimientos se realizaron de acuerdo con los estándares y los equipos quedan totalmente funcionales',
  clientSignature: {
    signatureDataUrl: '',
    name: 'Lcda. María Intriago',
    idNumber: '1312457890',
    role: 'Jefa de Servicios Generales',
    signedAt: '',
  },
  technicianSignature: {
    signatureDataUrl: '',
    name: 'ING. Eduardo Marín',
    idNumber: '1308013182001',
    role: 'Técnico Especialista en Mantenimiento',
    signedAt: '',
  },
  companyInfo: { ...DEFAULT_COMPANY_SETTINGS },
  status: 'borrador',
  createdAt: '2025-12-22T09:30:00Z',
  updatedAt: '2025-12-22T11:45:00Z',
  sentLog: [],
};

const STORAGE_KEY_REPORTS = 'safework_reports_v1';
const STORAGE_KEY_SETTINGS = 'safework_settings_v1';
const STORAGE_KEY_CURRENT = 'safework_current_report_v1';

export function getStoredSettings(): CompanySettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (saved) {
      return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_COMPANY_SETTINGS;
}

export function saveStoredSettings(settings: CompanySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function getStoredReports(): ServiceReport[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading reports:', e);
  }
  return [SAMPLE_REPORT];
}

export function saveStoredReports(reports: ServiceReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('Error saving reports:', e);
  }
}

export function getCurrentReport(): ServiceReport {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading current report:', e);
  }
  return SAMPLE_REPORT;
}

export function saveCurrentReport(report: ServiceReport): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(report));
  } catch (e) {
    console.error('Error saving current report:', e);
  }
}

export function createNewReport(counter: number, companySettings: CompanySettings): ServiceReport {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const paddedNumber = String(counter).padStart(9, '0');

  return {
    id: `rep-${Date.now()}`,
    reportNumber: `N·${paddedNumber}`,
    date: { year, month, day },
    client: {
      name: '',
      address: '',
      phone: '',
      email: '',
      contactPerson: '',
    },
    equipment: {
      name: '',
      brand: '',
      model: '',
      series: '',
      quantity: '1',
      area: '',
    },
    maintenanceType: 'preventivo',
    equipmentStatus: 'funcional',
    equipmentStatusOther: '',
    verification: {
      externalInspection: 'B',
      operatingTests: 'B',
      notes: '',
    },
    workDone: '',
    diagnosticDetail: '',
    observations: 'Los mantenimientos se realizaron de acuerdo con los estándares y los equipos quedan totalmente funcionales',
    clientSignature: {
      signatureDataUrl: '',
      name: '',
      idNumber: '',
      role: '',
      signedAt: '',
    },
    technicianSignature: {
      signatureDataUrl: '',
      name: companySettings.technicianName,
      idNumber: companySettings.ruc.replace(/[^\d]/g, '') || '',
      role: companySettings.technicianTitle,
      signedAt: '',
    },
    companyInfo: { ...companySettings },
    status: 'borrador',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sentLog: [],
  };
}

// ------------------- PROFORMAS (COTIZACIONES) -------------------

export const SAMPLE_PROFORMA: Proforma = {
  id: 'prf-sample-096',
  documentTitle: 'Factura',
  proformaNumber: '096',
  date: {
    year: '2026',
    month: '5',
    day: '13',
  },
  validUntilDays: 31,
  expirationDate: '2026-06-13',
  deliveryDate: '2026-05-13',
  client: {
    name: 'Sociedad de lucha contra el cáncer de Manabí',
    rucOrCi: '139171900001',
    address: 'Autopista del Valle Manabí Guillén',
    city: 'PORTOVIEJO',
    country: 'Ecuador',
    phone: '0991182698',
    email: 'mantenimiento@solcaportoviejo.med.ec',
    contactPerson: 'Ing. Mantenimiento',
  },
  equipmentRef: {
    name: 'EQUIPO DE LAVANDERÍA / DESAGÜE',
    brand: 'KII',
    model: 'KII-854',
    series: 'KII854-2026',
    locationOrArea: 'Área de Servicios Generales',
  },
  relatedServiceReportNumber: 'N·000000001',
  items: [
    {
      id: 'p-item-1',
      itemNumber: 1,
      category: 'repuesto',
      description: 'tubo de desague kii854',
      quantity: 1,
      unitPrice: 130.0,
      discountPercentage: 30.63,
      taxExempt: false,
      subtotal: 90.18,
    },
  ],
  subtotalZero: 0.0,
  subtotalTaxed: 90.18,
  subtotalGeneral: 90.18,
  discountPercentage: 0,
  discountAmount: 0.0,
  taxRate: 0,
  taxAmount: 0.0,
  total: 90.18,
  currency: '$',
  useCommaDecimal: true,
  commercialTerms: {
    deliveryTime: 'Inmediata / En sitio',
    paymentMethod: 'En su totalidad (100% contra entrega / transferencia bancaria)',
    warranty: '90 días calendario en repuestos y accesorios originales.',
    validity: '30 días calendario a partir de su emisión.',
    bankingDetails:
      'Banco Pichincha | Cta. Corriente | Safe Work Corporation | R.U.C. 1308013182001',
    notes:
      's.w.corporation, sitio los Angeles s/n, 130112 PORTOVIEJO, Ecuador',
  },
  technicianSignature: {
    signatureDataUrl: '',
    name: 'ING. Eduardo Marin',
    idNumber: '1308013182001',
    role: 'Ingeniero de Mantenimiento / Técnico Responsable',
    signedAt: '',
  },
  clientSignature: {
    signatureDataUrl: '',
    name: 'Sociedad de lucha contra el cáncer de Manabí',
    idNumber: '139171900001',
    role: 'Aprobación / Compras',
    signedAt: '',
  },
  companyInfo: { ...DEFAULT_COMPANY_SETTINGS },
  status: 'borrador',
  createdAt: '2026-05-13T10:00:00Z',
  updatedAt: '2026-05-13T10:00:00Z',
  sentLog: [],
};

const STORAGE_KEY_PROFORMAS = 'safework_proformas_v1';
const STORAGE_KEY_CURRENT_PROFORMA = 'safework_current_proforma_v1';

export function getStoredProformas(): Proforma[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROFORMAS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading proformas:', e);
  }
  return [SAMPLE_PROFORMA];
}

export function saveStoredProformas(proformas: Proforma[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFORMAS, JSON.stringify(proformas));
  } catch (e) {
    console.error('Error saving proformas:', e);
  }
}

export function getCurrentProforma(): Proforma {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_PROFORMA);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.commercialTerms?.paymentMethod || parsed.commercialTerms.paymentMethod.includes('50%')) {
        parsed.commercialTerms = {
          ...(parsed.commercialTerms || {}),
          paymentMethod: 'En su totalidad (100% contra entrega / transferencia bancaria)',
        };
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading current proforma:', e);
  }
  return SAMPLE_PROFORMA;
}

export function saveCurrentProforma(proforma: Proforma): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_PROFORMA, JSON.stringify(proforma));
  } catch (e) {
    console.error('Error saving current proforma:', e);
  }
}

export function recalculateProformaTotals(
  items: ProformaItem[],
  discountPercentage = 0,
  taxRate = 15
): {
  subtotalZero: number;
  subtotalTaxed: number;
  subtotalGeneral: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
} {
  let subtotalZero = 0;
  let subtotalTaxed = 0;
  let totalItemDiscounts = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const gross = qty * price;
    const itemDiscPct = Number(item.discountPercentage) || 0;
    const itemDisc = (gross * itemDiscPct) / 100;
    const itemNet = Number((gross - itemDisc).toFixed(2));
    totalItemDiscounts += itemDisc;

    if (item.taxExempt) {
      subtotalZero += itemNet;
    } else {
      subtotalTaxed += itemNet;
    }
  });

  const subtotalGeneral = Number((subtotalZero + subtotalTaxed).toFixed(2));
  const globalDiscount = Number(((subtotalGeneral * (discountPercentage || 0)) / 100).toFixed(2));
  const discountAmount = Number((totalItemDiscounts + globalDiscount).toFixed(2));

  const taxableBase = Math.max(
    0,
    subtotalTaxed - (subtotalGeneral > 0 ? (subtotalTaxed / subtotalGeneral) * globalDiscount : 0)
  );
  const taxAmount = Number(((taxableBase * (taxRate || 0)) / 100).toFixed(2));
  const total = Number((subtotalGeneral - globalDiscount + taxAmount).toFixed(2));

  return {
    subtotalZero: Number(subtotalZero.toFixed(2)),
    subtotalTaxed: Number(subtotalTaxed.toFixed(2)),
    subtotalGeneral,
    discountAmount,
    taxAmount,
    total,
  };
}

export function createNewProforma(
  counter: number,
  companySettings: CompanySettings,
  baseReport?: ServiceReport
): Proforma {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const paddedNumber = String(counter).padStart(4, '0');
  const proformaNumber = `PRF-${year}-${paddedNumber}`;

  const expDate = new Date();
  expDate.setDate(expDate.getDate() + 15);
  const expirationDate = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')}`;

  const initialItems: ProformaItem[] = [
    {
      id: `item-${Date.now()}-1`,
      itemNumber: 1,
      category: 'mano_de_obra',
      description: baseReport?.workDone
        ? `Mantenimiento correctivo y provisión de componentes para ${baseReport.equipment.name || 'equipo'}`
        : 'Mantenimiento técnico especializado, diagnóstico y ajuste operativo.',
      quantity: 1,
      unitPrice: 180.0,
      taxExempt: false,
      subtotal: 180.0,
    },
  ];

  const totals = recalculateProformaTotals(initialItems, 0, 15);

  return {
    id: `prf-${Date.now()}`,
    documentTitle: 'Factura',
    proformaNumber,
    date: { year, month, day },
    validUntilDays: 15,
    expirationDate,
    deliveryDate: `${year}-${month}-${day}`,
    client: {
      name: baseReport?.client.name || '',
      rucOrCi: '',
      address: baseReport?.client.address || '',
      city: 'PORTOVIEJO',
      country: 'Ecuador',
      phone: baseReport?.client.phone || '',
      email: baseReport?.client.email || '',
      contactPerson: baseReport?.client.contactPerson || '',
    },
    equipmentRef: {
      name: baseReport?.equipment.name || '',
      brand: baseReport?.equipment.brand || '',
      model: baseReport?.equipment.model || '',
      series: baseReport?.equipment.series || '',
      locationOrArea: baseReport?.equipment.area || '',
    },
    relatedServiceReportNumber: baseReport?.reportNumber || undefined,
    items: initialItems,
    ...totals,
    discountPercentage: 0,
    taxRate: 0,
    currency: '$',
    useCommaDecimal: true,
    commercialTerms: {
      deliveryTime: companySettings.defaultDeliveryTime || 'Inmediata / En sitio tras confirmación.',
      paymentMethod: companySettings.defaultPaymentMethod || 'En su totalidad (100% contra entrega o anticipado).',
      warranty: '90 días calendario en repuestos y 60 días en mano de obra técnica.',
      validity: `${companySettings.defaultValidityDays || 15} días calendario a partir de la fecha de emisión.`,
      bankingDetails: companySettings.defaultBankingDetails || `Banco Pichincha | Cta. Corriente | SAFE WORK CORPORATION S.A. | R.U.C. 1308013182001 | Email: ${companySettings.technicianEmail}`,
      notes:
        companySettings.defaultNotes || 's.w.corporation, sitio los Angeles s/n, 130112 PORTOVIEJO, Ecuador',
    },
    technicianSignature: {
      signatureDataUrl: '',
      name: companySettings.technicianName,
      idNumber: companySettings.ruc.replace(/[^\d]/g, '') || '',
      role: companySettings.technicianTitle,
      signedAt: '',
    },
    clientSignature: {
      signatureDataUrl: '',
      name: '',
      idNumber: '',
      role: 'Aprobación / Compras',
      signedAt: '',
    },
    companyInfo: { ...companySettings },
    status: 'borrador',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sentLog: [],
  };
}
