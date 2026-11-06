import React, { useState } from 'react';
import {
  X,
  History,
  Search,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  Plus,
} from 'lucide-react';
import { ServiceReport } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reports: ServiceReport[];
  currentReportId: string;
  onSelectReport: (report: ServiceReport) => void;
  onDuplicateReport: (report: ServiceReport) => void;
  onDeleteReport: (reportId: string) => void;
  onCreateNew: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  reports,
  currentReportId,
  onSelectReport,
  onDuplicateReport,
  onDeleteReport,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = reports.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      r.reportNumber.toLowerCase().includes(term) ||
      r.client.name.toLowerCase().includes(term) ||
      r.equipment.name.toLowerCase().includes(term) ||
      `${r.date.year}-${r.date.month}-${r.date.day}`.includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-wide">
              Historial de Hojas de Servicio
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar & Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
          <button
            onClick={() => {
              onCreateNew();
              onClose();
            }}
            className="w-full py-2 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            Crear Nueva Hoja de Servicio
          </button>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, equipo, N° de reporte..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* List of reports */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No se encontraron hojas de servicio.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = item.id === currentReportId;
              const hasClientSig = !!item.clientSignature?.signatureDataUrl;
              const hasTechSig = !!item.technicianSignature?.signatureDataUrl;
              const isSent = (item.sentLog && item.sentLog.length > 0) || item.status === 'enviado';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-xs text-blue-700">
                      {item.reportNumber}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.date.year}-{item.date.month}-{item.date.day}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1">
                    {item.client.name || 'Cliente sin nombre'}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                    {item.equipment.name || 'Equipo no especificado'} ({item.equipment.brand || '—'})
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {/* Signatures status */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        hasClientSig && hasTechSig
                          ? 'bg-emerald-100 text-emerald-800'
                          : hasClientSig || hasTechSig
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Firmas: {Number(hasClientSig) + Number(hasTechSig)}/2
                    </span>

                    {/* Sent status */}
                    {isSent ? (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Send className="w-2.5 h-2.5" /> Enviado por correo
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Borrador
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectReport(item);
                        onClose();
                      }}
                      className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 text-[11px]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {isSelected ? 'Editando actualmente' : 'Abrir Hoja'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDuplicateReport(item)}
                        title="Duplicar como nueva hoja"
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {reports.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `¿Seguro que deseas eliminar la hoja ${item.reportNumber}?`
                              )
                            ) {
                              onDeleteReport(item.id);
                            }
                          }}
                          title="Eliminar hoja"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
