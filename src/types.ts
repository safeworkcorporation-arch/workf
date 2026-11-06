export type MaintenanceType = 'preventivo' | 'correctivo' | 'verificacion' | '';
export type EquipmentStatus = 'funcional' | 'no_enciende' | 'otro' | '';
export type EvaluationGrade = 'B' | 'R' | 'M' | 'NA' | '';

export interface DigitalSignature {
  signatureDataUrl: string;
  name: string;
  idNumber: string;
  role?: string;
  signedAt?: string;
}

export interface CompanySettings {
  companyName: string;
  subtitle: string;
  logoUrl?: string;
  technicianName: string;
  technicianTitle: string;
  technicianPhone: string;
  technicianEmail: string;
  address: string;
  cityCountry: string;
  ruc: string;
  defaultEmailCC: string;
  defaultPaymentMethod?: string;
  defaultDeliveryTime?: string;
  defaultValidityDays?: number;
  defaultDocumentTitle?: string;
  defaultBankingDetails?: string;
  defaultNotes?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    provider?: 'gmail' | 'outlook' | 'yahoo' | 'custom';
  };
}

export interface ServiceReport {
  id: string; // internal UUID or report number
  reportNumber: string; // e.g. "N-000000001"
  date: {
    year: string;
    month: string;
    day: string;
  };
  client: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
  };
  equipment: {
    name: string;
    brand: string;
    model: string;
    series: string;
    quantity: string | number;
    area: string;
  };
  maintenanceType: MaintenanceType;
  equipmentStatus: EquipmentStatus;
  equipmentStatusOther?: string;
  verification: {
    externalInspection: EvaluationGrade;
    operatingTests: EvaluationGrade;
    notes: string;
  };
  workDone: string;
  diagnosticDetail: string;
  observations: string;
  clientSignature: DigitalSignature;
  technicianSignature: DigitalSignature;
  companyInfo: CompanySettings;
  status: 'borrador' | 'firmado' | 'enviado';
  createdAt: string;
  updatedAt: string;
  sentLog?: Array<{
    sentTo: string;
    sentAt: string;
    previewUrl?: string;
  }>;
}

export type ProformaItemCategory =
  | 'repuesto'
  | 'mano_de_obra'
  | 'insumo'
  | 'servicio'
  | 'calibracion'
  | 'otro';

export interface ProformaItem {
  id: string;
  itemNumber: number;
  description: string;
  category: ProformaItemCategory;
  quantity: number;
  unitPrice: number;
  discountPercentage?: number; // e.g. 30.63%
  taxExempt?: boolean; // Tarifa 0% de IVA
  subtotal: number;
}

export type ProformaStatus = 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'facturada';

export interface Proforma {
  id: string;
  documentTitle?: 'Proforma' | 'Factura' | 'Cotización' | string;
  proformaNumber: string; // e.g. "096" or "PRF-2026-0001"
  date: {
    year: string;
    month: string;
    day: string;
  };
  validUntilDays: number; // e.g. 15 or 30
  expirationDate: string; // "YYYY-MM-DD" or formatted date
  deliveryDate?: string; // e.g. "13/5/2026" or "YYYY-MM-DD"
  client: {
    name: string;
    rucOrCi: string;
    address: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
    contactPerson?: string;
  };
  equipmentRef?: {
    name: string;
    brand: string;
    model: string;
    series: string;
    locationOrArea: string;
  };
  relatedServiceReportNumber?: string;
  items: ProformaItem[];
  subtotalZero: number;
  subtotalTaxed: number;
  subtotalGeneral: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number; // e.g. 0 or 15 (%)
  taxAmount: number;
  total: number;
  currency: string;
  useCommaDecimal?: boolean; // whether to format 90,18 vs 90.18
  commercialTerms: {
    deliveryTime: string;
    paymentMethod: string;
    warranty: string;
    validity: string;
    bankingDetails: string;
    notes?: string;
  };
  technicianSignature: DigitalSignature;
  clientSignature?: DigitalSignature;
  companyInfo: CompanySettings;
  status: ProformaStatus;
  createdAt: string;
  updatedAt: string;
  sentLog?: Array<{
    sentTo: string;
    sentAt: string;
    previewUrl?: string;
  }>;
}
