

import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { translateClerkError } from '../utils/errorTranslations';

const Login: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'login' | 'forgot-password' | 'reset-password' | 'verify-2fa'>('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.create({ identifier: email, password });
      console.log('Clerk SignIn Result:', result);
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_second_factor') {
        setStep('verify-2fa');
      } else {
        setError(`Ação necessária: ${result.status}`);
      }
    } catch (err: any) {
      setError(translateClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep('reset-password');
    } catch (err: any) {
      setError(translateClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Não foi possível completar. Verifique o código.');
      }
    } catch (err: any) {
      setError(translateClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: 'totp',
        code,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        setError('Não foi possível verificar. Verifique o código digitado.');
      }
    } catch (err: any) {
      setError(translateClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-10 pb-4 text-center">
          <div className="size-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary-500/20">
            <span className="material-symbols-outlined text-4xl">account_balance</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">UNINASSAU OLINDA</h1>
          <p className="text-gray-500 text-xs font-bold mt-1 tracking-[0.2em] uppercase">Sistema de Descontos</p>
        </div>

        {step === 'login' && (
          <form className="p-10 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl flex items-start gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail de Acesso</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full pl-12 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sua Senha</label>
                <button type="button" onClick={() => setStep('forgot-password')} className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest">Esqueci a senha</button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-12 pr-12 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors">
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || !isLoaded} className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-xs">
              <span>{loading ? 'Validando...' : 'Entrar no Sistema'}</span>
              {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">login</span>}
            </button>
          </form>
        )}

        {step === 'forgot-password' && (
          <form className="p-10 space-y-6" onSubmit={handleForgotPassword}>
            <div className="text-center mb-6">
              <div className="size-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl">lock_reset</span>
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">Recuperar Senha</h3>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">Enviaremos um código para o seu e-mail de acesso.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl flex items-start gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">E-mail Cadastrado</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full pl-12 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-gray-900/10 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-xs">
              <span>{loading ? 'Enviando...' : 'Enviar Código'}</span>
              {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">send</span>}
            </button>

            <button type="button" onClick={() => setStep('login')} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-600 transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Voltar para o Login
            </button>
          </form>
        )}

        {step === 'reset-password' && (
          <form className="p-10 space-y-6" onSubmit={handleResetPassword}>
            <div className="text-center mb-6">
              <div className="size-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                <span className="material-symbols-outlined text-2xl">mark_email_unread</span>
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">Redefinir Senha</h3>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">Insira o código enviado e sua nova senha de acesso.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl flex items-start gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Código do E-mail</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">pin</span>
                  <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" required className="w-full pl-12 pr-4 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono text-center tracking-[0.5em]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nova Senha</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock_outline</span>
                  <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required className="w-full pl-12 pr-12 py-3 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors">
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-xs">
              <span>{loading ? 'Alterando...' : 'Redefinir e Entrar'}</span>
              {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">check_circle</span>}
            </button>

            <button type="button" onClick={() => setStep('forgot-password')} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">refresh</span>
              Reenviar código
            </button>
          </form>
        )}

        {step === 'verify-2fa' && (
          <form className="p-10 space-y-6" onSubmit={handleVerify2FA}>
            <div className="text-center mb-6">
              <div className="size-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4 border border-amber-100 shadow-sm shadow-amber-500/10">
                <span className="material-symbols-outlined text-4xl">verified_user</span>
              </div>
              <h3 className="font-black text-gray-900 uppercase tracking-tight">Verificação em 2 Etapas</h3>
              <p className="text-[11px] text-gray-500 mt-2 font-medium leading-relaxed">
                Insira o código de 6 dígitos gerado pelo seu aplicativo de autenticação.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-xl flex items-start gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">Código de Segurança</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">key</span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    required
                    autoFocus
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-gray-100 rounded-2xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg font-mono text-center tracking-[0.6em]"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 mt-4 uppercase tracking-[0.2em] text-xs">
              <span>{loading ? 'Verificando...' : 'Confirmar Código'}</span>
              {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">security</span>}
            </button>

            <button type="button" onClick={() => setStep('login')} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Voltar para o Login
            </button>
          </form>
        )}

        <div className="bg-gray-50 px-10 py-6 text-center border-t border-gray-100 italic">
          <p className="text-[10px] text-gray-400">UNINASSAU Olinda • Segurança Ativa</p>
        </div>
      </div>
      <p className="mt-8 text-xs text-gray-400 font-medium">© 2024 Gestão Acadêmica Integrada. v2.5.0</p>
    </div>
  );
};


export default Login;

