import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, PenTool, Sparkles } from 'lucide-react';
import { DigitalSignature } from '../types';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'client' | 'technician';
  initialSignature?: DigitalSignature;
  onSaveSignature: (sig: DigitalSignature) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  initialSignature,
  onSaveSignature,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokes, setStrokes] = useState<ImageData[]>([]);
  const [name, setName] = useState(initialSignature?.name || '');
  const [idNumber, setIdNumber] = useState(initialSignature?.idNumber || '');
  const [role, setRole] = useState(initialSignature?.role || '');

  useEffect(() => {
    if (isOpen) {
      setName(initialSignature?.name || '');
      setIdNumber(initialSignature?.idNumber || '');
      setRole(initialSignature?.role || '');
      setStrokes([]);
      setHasDrawn(!!initialSignature?.signatureDataUrl);

      // Delay to let modal render and size canvas correctly
      setTimeout(() => {
        initCanvas();
      }, 50);
    }
  }, [isOpen, initialSignature]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#1e293b'; // deep indigo charcoal ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear background to pure white or transparent
    ctx.clearRect(0, 0, rect.width, rect.height);

    // If there is existing signature, render it
    if (initialSignature?.signatureDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = initialSignature.signatureDataUrl;
    }
  };

  const saveStrokeState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStrokes((prev) => [...prev.slice(-15), state]);
    } catch (e) {
      console.warn('Could not save canvas state:', e);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveStrokeState();
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setStrokes([]);
    setHasDrawn(false);
  };

  const undoLastStroke = () => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStrokes = [...strokes];
    const previousState = newStrokes.pop();
    setStrokes(newStrokes);

    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    } else {
      clearCanvas();
    }
  };

  const loadSampleSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.beginPath();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;

    // Simulated authentic signature flourish
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    ctx.moveTo(cx - 100, cy + 10);
    ctx.bezierCurveTo(cx - 60, cy - 40, cx - 20, cy - 20, cx, cy);
    ctx.bezierCurveTo(cx + 30, cy + 30, cx + 50, cy - 35, cx + 80, cy - 10);
    ctx.bezierCurveTo(cx + 95, cy + 5, cx + 70, cy + 30, cx + 10, cy + 25);
    ctx.bezierCurveTo(cx - 40, cy + 20, cx - 90, cy + 15, cx + 105, cy + 18);
    ctx.stroke();

    setHasDrawn(true);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let dataUrl = '';
    if (hasDrawn) {
      dataUrl = canvas.toDataURL('image/png');
    }

    onSaveSignature({
      signatureDataUrl: dataUrl,
      name: name.trim(),
      idNumber: idNumber.trim(),
      role: role.trim(),
      signedAt: new Date().toISOString(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold tracking-wide">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Dibuja tu firma a continuación usando tu dedo, lápiz táctil o mouse.
          </p>

          {/* Signature Canvas Box */}
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden select-none touch-none">
            <canvas
              ref={canvasRef}
              className="w-full h-44 cursor-crosshair block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {/* Signature guideline */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center pointer-events-none opacity-40">
              <span className="text-sm font-bold text-slate-400 mr-2">✕</span>
              <div className="flex-1 border-b-2 border-slate-400"></div>
            </div>

            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                Firmar aquí
              </div>
            )}
          </div>

          {/* Canvas Controls */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpiar
              </button>
              {strokes.length > 0 && (
                <button
                  type="button"
                  onClick={undoLastStroke}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Deshacer
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={loadSampleSignature}
              className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
              title="Cargar trazo de ejemplo para pruebas rápidas"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Firma de muestra
            </button>
          </div>

          {/* Signer Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'client' ? 'Ej. Lcda. María Intriago' : 'Ej. Ing. Eduardo Marín'}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                {type === 'client' ? 'Cédula / Identificación' : 'R.U.C. / Cédula'}
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="1308013182"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                Cargo / Departamento
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder={type === 'client' ? 'Jefa de Lavandería / Mantenimiento' : 'Ingeniero de Servicio'}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasDrawn && !name}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            Aplicar Firma Digital
          </button>
        </div>
      </div>
    </div>
  );
};
