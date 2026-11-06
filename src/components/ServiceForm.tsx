import React, { useState } from 'react';
import { ServiceReport } from '../types';
import {
  Calendar,
  Building,
  Wrench,
  Activity,
  CheckCircle2,
  FileText,
  PenTool,
  Check,
  AlertCircle,
  PlusCircle,
  Sparkles,
  Plus,
  X,
} from 'lucide-react';

interface ServiceFormProps {
  report: ServiceReport;
  onChange: (updatedReport: ServiceReport) => void;
  onOpenSignatureModal: (type: 'client' | 'technician') => void;
}

const DEFAULT_TASKS = [
  'Limpieza de Tambor',
  'Filtros y Sistema de Desagüe',
  'Sistema Eléctrico',
  'Fuente de Alimentación',
  'Motor Rotatorio',
  'Sistemas de Engranajes',
  'Calibración y Sensores',
  'Lubricación de Rodamientos',
  'Ajuste de Bandas y Poleas',
  'Pruebas de Ciclos de Lavado/Centrifugado',
];

const STORAGE_KEY_TASKS = 'safework_custom_tasks_v1';

const COMMON_EQUIPMENT = [
  'LABADORA INDUSTRIAL',
  'SECADORA INDUSTRIAL',
  'AUTOCLAVE A VAPOR',
  'CENTRIFUGA HOSPITALARIA',
  'MONITOR DE SIGNOS VITALES',
  'BOMBA DE INFUSIÓN',
  'EQUIPO DE RAYOS X',
  'GENERADOR ELÉCTRICO',
  'ESTERILIZADOR',
  'DESFIBRILADOR',
];

export const ServiceForm: React.FC<ServiceFormProps> = ({
  report,
  onChange,
  onOpenSignatureModal,
}) => {
  const [tasksList, setTasksList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading custom tasks:', e);
    }
    return DEFAULT_TASKS;
  });

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const handleAddNewTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTaskName.trim();
    if (!trimmed) return;

    let updated = tasksList;
    if (!tasksList.includes(trimmed)) {
      updated = [...tasksList, trimmed];
      setTasksList(updated);
      try {
        localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving tasks:', err);
      }
    }

    // Append to the report's workDone field
    appendWorkTask(trimmed);
    setNewTaskName('');
    setIsAddingTask(false);
  };

  const handleRemoveTask = (taskToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tasksList.filter((t) => t !== taskToRemove);
    setTasksList(updated);
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
    } catch (err) {
      console.error('Error removing task:', err);
    }
  };
  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    const updated = JSON.parse(JSON.stringify(report));
    let current = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(updated);
  };

  const setTodayDate = () => {
    const now = new Date();
    onChange({
      ...report,
      date: {
        year: now.getFullYear().toString(),
        month: String(now.getMonth() + 1).padStart(2, '0'),
        day: String(now.getDate()).padStart(2, '0'),
      },
    });
  };

  const appendWorkTask = (task: string) => {
    const current = report.workDone?.trim() || '';
    if (!current) {
      updateField('workDone', task);
    } else if (!current.includes(task)) {
      updateField('workDone', `${current} - ${task}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* SECCIÓN 1: DATOS DEL REPORTE Y CLIENTE */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
              1. Datos Generales y Cliente
            </h2>
          </div>
          <button
            type="button"
            onClick={setTodayDate}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            Poner fecha de hoy
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Número de Reporte
            </label>
            <input
              type="text"
              value={report.reportNumber}
              onChange={(e) => updateField('reportNumber', e.target.value)}
              placeholder="N·000000001"
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Año (AAAA)
            </label>
            <input
              type="text"
              value={report.date.year}
              onChange={(e) => updateField('date.year', e.target.value)}
              placeholder="2025"
              maxLength={4}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Mes (MM)
            </label>
            <input
              type="text"
              value={report.date.month}
              onChange={(e) => updateField('date.month', e.target.value)}
              placeholder="12"
              maxLength={2}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Día (DD)
            </label>
            <input
              type="text"
              value={report.date.day}
              onChange={(e) => updateField('date.day', e.target.value)}
              placeholder="22"
              maxLength={2}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Cliente / Hospital / Empresa *
            </label>
            <input
              type="text"
              value={report.client.name}
              onChange={(e) => updateField('client.name', e.target.value)}
              placeholder="Ej. Solca Portoviejo"
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Dirección del Cliente *
            </label>
            <input
              type="text"
              value={report.client.address}
              onChange={(e) => updateField('client.address', e.target.value)}
              placeholder="Ej. Autopista del Valle Manabí Guillén"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Correo Electrónico del Cliente (Para envío automático)
            </label>
            <input
              type="email"
              value={report.client.email || ''}
              onChange={(e) => updateField('client.email', e.target.value)}
              placeholder="mantenimiento@solcaportoviejo.med.ec"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Persona de Contacto / Responsable
            </label>
            <input
              type="text"
              value={report.client.contactPerson || ''}
              onChange={(e) => updateField('client.contactPerson', e.target.value)}
              placeholder="Ej. Ing. Administrador de Lavandería"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: INFORMACIÓN DEL EQUIPO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Wrench className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
            2. Información del Equipo
          </h2>
        </div>

        {/* Quick equipment suggestions */}
        <div className="mb-4">
          <span className="text-[11px] text-slate-500 font-medium mr-2">Sugerencias rápidas:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {COMMON_EQUIPMENT.slice(0, 5).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => updateField('equipment.name', item)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors"
              >
                + {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Equipo *
            </label>
            <input
              type="text"
              value={report.equipment.name}
              onChange={(e) => updateField('equipment.name', e.target.value)}
              placeholder="LABADORA INDUSTRIAL"
              className="w-full px-3 py-2 text-xs uppercase font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Marca *
            </label>
            <input
              type="text"
              value={report.equipment.brand}
              onChange={(e) => updateField('equipment.brand', e.target.value)}
              placeholder="DOMUS"
              className="w-full px-3 py-2 text-xs uppercase font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Modelo
            </label>
            <input
              type="text"
              value={report.equipment.model}
              onChange={(e) => updateField('equipment.model', e.target.value)}
              placeholder="DOMUS DLS 27 TOUCH E - DOMUSDLS36 TOUCH E"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Cantidad
            </label>
            <input
              type="text"
              value={report.equipment.quantity}
              onChange={(e) => updateField('equipment.quantity', e.target.value)}
              placeholder="2"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Serie(s)
            </label>
            <textarea
              rows={2}
              value={report.equipment.series}
              onChange={(e) => updateField('equipment.series', e.target.value)}
              placeholder="DLS-27&#10;DLS-36"
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Área / Ubicación
            </label>
            <input
              type="text"
              value={report.equipment.area}
              onChange={(e) => updateField('equipment.area', e.target.value)}
              placeholder="Lavandería"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: TIPO DE MANTENIMIENTO Y ESTADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TIPO DE MANTENIMIENTO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide border-b border-slate-100 pb-3 mb-4">
              3. Tipo de Mantenimiento
            </h2>
            <div className="space-y-2">
              {[
                { id: 'preventivo', label: 'Mantenimiento Preventivo' },
                { id: 'correctivo', label: 'Mantenimiento Correctivo' },
                { id: 'verificacion', label: 'Verificación' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    report.maintenanceType === item.id
                      ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">{item.label}</span>
                  <input
                    type="radio"
                    name="maintenanceType"
                    checked={report.maintenanceType === item.id}
                    onChange={() => updateField('maintenanceType', item.id)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ESTADO DEL EQUIPO */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide border-b border-slate-100 pb-3 mb-4">
            4. Estado del Equipo
          </h2>
          <div className="space-y-2">
            {[
              { id: 'funcional', label: 'Funcional' },
              { id: 'no_enciende', label: 'No enciende' },
              { id: 'otro', label: 'Otro. ¿Cuál?' },
            ].map((item) => (
              <label
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  report.equipmentStatus === item.id
                    ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-xs">{item.label}</span>
                <input
                  type="radio"
                  name="equipmentStatus"
                  checked={report.equipmentStatus === item.id}
                  onChange={() => updateField('equipmentStatus', item.id)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}

            {report.equipmentStatus === 'otro' && (
              <div className="pt-2">
                <input
                  type="text"
                  value={report.equipmentStatusOther || ''}
                  onChange={(e) => updateField('equipmentStatusOther', e.target.value)}
                  placeholder="Especificar estado del equipo..."
                  className="w-full px-3 py-2 text-xs border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: VERIFICACIÓN DEL EQUIPO */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
            5. Verificación del Equipo
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inspección Externa */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">
              Inspección Externa
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(['B', 'R', 'M', 'NA'] as const).map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => updateField('verification.externalInspection', grade)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                    report.verification.externalInspection === grade
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              B: Bueno / R: Regular / M: Malo / NA: No Aplica
            </p>
          </div>

          {/* Pruebas de Funcionamiento */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-700 uppercase mb-3">
              Pruebas de Funcionamiento
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {(['B', 'R', 'M', 'NA'] as const).map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => updateField('verification.operatingTests', grade)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                    report.verification.operatingTests === grade
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              B: Bueno / R: Regular / M: Malo / NA: No Aplica
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Observaciones de Verificación
          </label>
          <input
            type="text"
            value={report.verification.notes}
            onChange={(e) => updateField('verification.notes', e.target.value)}
            placeholder="Ej. Equipos limpios, sin vibraciones anómalas en centrifugado."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* SECCIÓN 5: TRABAJO(S) REALIZADO(S) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
              6. Trabajo(s) Realizado(s)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            Haz clic en las tareas para agregarlas rápidamente
          </span>
        </div>

        {/* Quick add tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {tasksList.map((task) => {
            const isSelected = report.workDone?.includes(task);

            return (
              <div
                key={task}
                className={`inline-flex items-center rounded-lg border transition-all text-[11px] ${
                  isSelected
                    ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-2xs'
                    : 'bg-slate-100 border-slate-200 hover:border-purple-300 hover:bg-purple-50/70 text-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => appendWorkTask(task)}
                  className="px-2.5 py-1 flex items-center gap-1 font-medium hover:text-purple-800"
                  title={
                    isSelected
                      ? 'Ya incluido en el reporte (clic para volver a agregar)'
                      : 'Clic para agregar a la hoja de servicio'
                  }
                >
                  <PlusCircle
                    className={`w-3 h-3 ${
                      isSelected ? 'text-purple-700' : 'text-purple-500'
                    }`}
                  />
                  <span>{task}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemoveTask(task, e)}
                  title={`Eliminar "${task}" de la lista`}
                  className="px-1.5 py-1 text-slate-400 hover:text-red-500 rounded-r-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Add new task input or button */}
          {isAddingTask ? (
            <form
              onSubmit={handleAddNewTask}
              className="inline-flex items-center gap-1 bg-white border-2 border-purple-400 rounded-lg p-0.5 shadow-sm"
            >
              <input
                type="text"
                autoFocus
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Nombre del nuevo trabajo..."
                className="text-xs px-2.5 py-1 outline-none text-slate-800 w-48 sm:w-60"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskName('');
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingTask(true)}
              className="text-[11px] px-3 py-1 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/60 hover:bg-purple-100 text-purple-700 font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir nuevo tipo de trabajo</span>
            </button>
          )}
        </div>

        <textarea
          rows={3}
          value={report.workDone}
          onChange={(e) => updateField('workDone', e.target.value)}
          placeholder="Limpieza de Tambor - Filtros y Sistema de Desagüe - Sistema Eléctrico - Fuente de Alimentación..."
          className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* SECCIÓN 6: DIAGNÓSTICO Y OBSERVACIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide border-b border-slate-100 pb-3 mb-4">
            7. Detalle del Diagnóstico
          </h2>
          <textarea
            rows={3}
            value={report.diagnosticDetail}
            onChange={(e) => updateField('diagnosticDetail', e.target.value)}
            placeholder="Parámetros técnicos, voltajes, presiones, inspección de desgastes..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide border-b border-slate-100 pb-3 mb-4">
            8. Observaciones o Recomendaciones
          </h2>
          <textarea
            rows={3}
            value={report.observations}
            onChange={(e) => updateField('observations', e.target.value)}
            placeholder="Los mantenimientos se realizaron de acuerdo con los estándares..."
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* SECCIÓN 7: FIRMAS DIGITALES */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <PenTool className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold uppercase text-slate-800 tracking-wide">
            9. Firmas Digitales (Firma Táctil o Mouse)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firma Cliente */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase">
                  Firma de Cliente
                </span>
                {report.clientSignature.signatureDataUrl ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Firmado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Pendiente
                  </span>
                )}
              </div>

              <div className="h-28 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3">
                {report.clientSignature.signatureDataUrl ? (
                  <img
                    src={report.clientSignature.signatureDataUrl}
                    alt="Firma de cliente"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Sin firma registrada</span>
                )}
              </div>

              <div className="text-xs text-slate-700 mb-3 space-y-0.5">
                <div className="font-semibold">
                  {report.clientSignature.name || report.client.contactPerson || 'Sin especificar'}
                </div>
                {report.clientSignature.idNumber && (
                  <div className="text-[11px] text-slate-500">
                    Cédula: {report.clientSignature.idNumber}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenSignatureModal('client')}
              className="w-full py-2.5 px-4 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <PenTool className="w-4 h-4" />
              {report.clientSignature.signatureDataUrl ? 'Modificar Firma de Cliente' : 'Firmar como Cliente'}
            </button>
          </div>

          {/* Firma Técnico */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800 uppercase">
                  Firma de Técnico
                </span>
                {report.technicianSignature.signatureDataUrl ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Firmado
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Pendiente
                  </span>
                )}
              </div>

              <div className="h-28 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-2 mb-3">
                {report.technicianSignature.signatureDataUrl ? (
                  <img
                    src={report.technicianSignature.signatureDataUrl}
                    alt="Firma de técnico"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Sin firma registrada</span>
                )}
              </div>

              <div className="text-xs text-slate-700 mb-3 space-y-0.5">
                <div className="font-semibold">
                  {report.technicianSignature.name || report.companyInfo.technicianName}
                </div>
                <div className="text-[11px] text-slate-500">
                  {report.companyInfo.ruc}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenSignatureModal('technician')}
              className="w-full py-2.5 px-4 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <PenTool className="w-4 h-4" />
              {report.technicianSignature.signatureDataUrl ? 'Modificar Firma de Técnico' : 'Firmar como Técnico'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
