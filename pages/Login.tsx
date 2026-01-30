

import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';

const Login: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      // Inicia o processo de login
      const result = await signIn.create({
        identifier: email,
        password,
      });

      // Se o status for completo, define a sessão como ativa
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else {
        // Caso haja mais passos (como MFA), lidamos aqui (opcional)
        console.log('Status do login:', result.status);
        setError('Ação adicional necessária para completar o login.');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      // Traduzindo mensagens de erro comuns do Clerk
      const msg = err.errors?.[0]?.message || '';
      if (msg.includes('identifier')) setError('E-mail ou senha incorretos.');
      else if (msg.includes('password')) setError('E-mail ou senha incorretos.');
      else setError('Ocorreu um erro ao validar suas credenciais.');
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

        <form className="p-10 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">E-mail</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">Senha</label>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha de acesso"
                required
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isLoaded}
            className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-black rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{loading ? 'ENTRANDO...' : 'ENTRAR NO SISTEMA'}</span>
            {!loading && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">login</span>}
          </button>
        </form>

        <div className="bg-gray-50 px-10 py-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Acesso exclusivo para colaboradores da <span className="font-bold">UNINASSAU OLINDA</span>.
            <br />Em caso de dúvidas, contate o <span className="text-primary-600 font-bold">Suporte de TI</span>.
          </p>
        </div>
      </div>
      <p className="mt-8 text-xs text-gray-400 font-medium">© 2024 Gestão Acadêmica Integrada. v2.5.0</p>
    </div>
  );
};


export default Login;

