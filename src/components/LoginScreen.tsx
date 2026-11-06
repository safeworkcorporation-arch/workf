import React, { useState } from 'react';
import { Lock, User, ShieldCheck, Eye, EyeOff, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { SafeWorkLogo } from './SafeWorkLogo';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
  companyLogoUrl?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  companyLogoUrl,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Verification against requested admin credentials:
    // User: adminwork
    // Password: wok1admin
    if (cleanUser === 'adminwork' && cleanPass === 'wok1admin') {
      setIsLoading(true);

      setTimeout(() => {
        const sessionData = {
          user: 'adminwork',
          role: 'admin',
          loggedAt: new Date().toISOString(),
          rememberMe,
        };

        if (rememberMe) {
          localStorage.setItem('safework_auth_session', JSON.stringify(sessionData));
        } else {
          sessionStorage.setItem('safework_auth_session', JSON.stringify(sessionData));
        }

        onLoginSuccess('adminwork');
      }, 400);
    } else {
      setError('Credenciales incorrectas. Verifique el usuario y la contraseña.');
    }
  };

  const isCustomLogo =
    Boolean(companyLogoUrl) &&
    companyLogoUrl !== '/safework-logo.png' &&
    (companyLogoUrl!.startsWith('data:') || companyLogoUrl!.startsWith('http'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none font-sans">
      {/* Background ambient decorative effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-md mb-4 ring-1 ring-slate-700/50">
            {isCustomLogo ? (
              <img
                src={companyLogoUrl}
                alt="Logo Empresa"
                className="h-14 max-w-[200px] object-contain drop-shadow-md"
              />
            ) : (
              <SafeWorkLogo size="lg" layout="vertical" inverted={true} />
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold mb-2 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Portal de Acceso Administrativo</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Safe Work Corporation
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Sistema Oficial de Gestión de Hojas de Servicio Técnico, Proformas y Facturación
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 ring-1 ring-white/5">
          <div className="mb-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Iniciar Sesión
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingrese con sus credenciales de administrador autorizadas.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">{error}</span>
                <span className="text-[11px] text-red-300/80">
                  Asegúrese de escribir correctamente el usuario y la contraseña.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Usuario Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese usuario"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-white text-sm placeholder-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-white text-sm placeholder-slate-500 transition-all outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1"
                />
                <span>Recordar sesión en este equipo</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-[0.99] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Accediendo al sistema...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Safe Work Corporation. Todos los derechos reservados.</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Acceso restringido para personal técnico y directivo.</p>
        </div>
      </div>
    </div>
  );
};
