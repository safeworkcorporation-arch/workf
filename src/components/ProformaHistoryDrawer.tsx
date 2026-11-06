import React, { useState } from 'react';
import {
  X,
  History,
  Search,
  FileText,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  DollarSign,
  Tag,
  Check,
} from 'lucide-react';
import { Proforma, ProformaStatus } from '../types';

interface ProformaHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  proformas: Proforma[];
  currentProformaId: string;
  onSelectProforma: (proforma: Proforma) => void;
  onDuplicateProforma: (proforma: Proforma) => void;
  onDeleteProforma: (proformaId: string) => void;
  onCreateNew: () => void;
}

export const ProformaHistoryDrawer: React.FC<ProformaHistoryDrawerProps> = ({
  isOpen,
  onClose,
  proformas,
  currentProformaId,
  onSelectProforma,
  onDuplicateProforma,
  onDeleteProforma,
  onCreateNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');

  if (!isOpen) return null;

  const filtered = proformas.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      p.proformaNumber.toLowerCase().includes(term) ||
      p.client.name.toLowerCase().includes(term) ||
      p.client.rucOrCi.toLowerCase().includes(term) ||
      (p.equipmentRef?.name && p.equipmentRef.name.toLowerCase().includes(term));

    if (!matchesTerm) return false;

    if (statusFilter === 'todas') return true;
    return p.status === statusFilter;
  });

  const totalValue = proformas.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
  const approvedCount = proformas.filter((p) => p.status === 'aprobada').length;

  const getStatusBadge = (status: ProformaStatus) => {
    switch (status) {
      case 'aprobada':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Aprobada
          </span>
        );
      case 'enviada':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3" /> Enviada
          </span>
        );
      case 'facturada':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            💼 Facturada
          </span>
        );
      case 'rechazada':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            ❌ Rechazada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3" /> Borrador
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold tracking-wide">
              Historial de Proformas y Cotizaciones
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats strip */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 font-medium">Total Cotizado:</span>{' '}
            <span className="font-bold font-mono text-slate-900">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Aprobadas:</span>{' '}
            <span className="font-bold text-emerald-600 font-mono">
              {approvedCount} / {proformas.length}
            </span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-slate-100 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente, RUC, número o equipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filters */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[10.5px]">
            {['todas', 'borrador', 'enviada', 'aprobada', 'facturada'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-bold capitalize whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No se encontraron proformas</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Intenta con otro término de búsqueda o crea una nueva cotización.
              </p>
            </div>
          ) : (
            filtered.map((proforma) => {
              const isSelected = proforma.id === currentProformaId;
              return (
                <div
                  key={proforma.id}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                  onClick={() => {
                    onSelectProforma(proforma);
                    onClose();
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded">
                      {proforma.proformaNumber}
                    </span>
                    {getStatusBadge(proforma.status)}
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {proforma.client.name || 'Cliente sin nombre'}
                  </h4>

                  {proforma.equipmentRef?.name && (
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                      ⚙️ {proforma.equipmentRef.name}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10.5px]">
                    <span className="text-slate-400">
                      {proforma.date.day}/{proforma.date.month}/{proforma.date.year}
                    </span>
                    <span className="font-mono font-bold text-xs text-slate-900">
                      ${Number(proforma.total || 0).toFixed(2)} USD
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-100/80">
                    <button
                      type="button"
                      title="Duplicar como nueva proforma"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProforma(proforma);
                        onClose();
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {proformas.length > 1 && (
                      <button
                        type="button"
                        title="Eliminar proforma"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `¿Estás seguro de eliminar la proforma ${proforma.proformaNumber}?`
                            )
                          ) {
                            onDeleteProforma(proforma.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Create New Button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              onCreateNew();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Crear Nueva Proforma
          </button>
        </div>
      </div>
    </div>
  );
};
