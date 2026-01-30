

import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';
import ConsultorDashboard from './pages/ConsultorDashboard';
import NovaSolicitacao from './pages/NovaSolicitacao';
import VisualizarSolicitacao from './pages/VisualizarSolicitacao';
import CoordenadorDashboard from './pages/CoordenadorDashboard';
import AnaliseCoordenador from './pages/AnaliseCoordenador';
import AnaliseDiretor from './pages/AnaliseDiretor';
import AdminDashboard from './pages/AdminDashboard';
import AdminCoringa from './pages/AdminCoringa';
import GerenciarCursos from './pages/GerenciarCursos';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import HistoricoCoordenador from './pages/HistoricoCoordenador';
import { supabase } from './supabase';


import { SignedIn, SignedOut, useUser, useAuth, useClerk } from '@clerk/clerk-react';

const App: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [navigationParams, setNavigationParams] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchProfile(user.id, user.primaryEmailAddress?.emailAddress);
    } else if (isLoaded && !isSignedIn) {
      setLoadingProfile(false);
      setProfile(null);
    }
  }, [isLoaded, isSignedIn, user]);

  const handleNavigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setNavigationParams(params);
  };

  const fetchProfile = async (clerkId: string, email?: string) => {
    try {
      setLoadingProfile(true);

      // 1. Tenta buscar o perfil existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users_profile')
        .select('*')
        .or(`clerk_id.eq.${clerkId}${email ? `,email.eq.${email}` : ''}`)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao buscar perfil:', fetchError);
      }

      // 2. Determina os dados do perfil
      const metadataRole = user?.publicMetadata?.role as UserRole;
      const finalRole = existingProfile?.perfil || metadataRole || UserRole.CONSULTOR;
      const clerkName = user?.fullName || email || existingProfile?.nome || 'Novo Colaborador';

      // 3. Upsert (Cria ou Atualiza)
      // Isso garante que se o usuário não existe, ele será criado e cairá no sistema imediatamente
      const { data: profileData, error: upsertError } = await supabase
        .from('users_profile')
        .upsert({
          clerk_id: clerkId,
          email: email || existingProfile?.email || '',
          nome: clerkName,
          perfil: finalRole,
          ativo: existingProfile ? existingProfile.ativo : true
        }, {
          onConflict: 'clerk_id'
        })
        .select()
        .single();

      if (upsertError) {
        console.error('Erro ao provisionar perfil:', upsertError);
        // Fallback: se o upsert via clerk_id falhou por algum motivo, tentamos usar o perfil existente se houver
        if (existingProfile) {
          setProfile(existingProfile);
          autoNavigate(existingProfile.perfil);
        }
      } else if (profileData) {
        setProfile(profileData);
        autoNavigate(profileData.perfil);
      }
    } catch (error) {
      console.error('Erro crítico no fluxo de perfil:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const autoNavigate = (perfil: UserRole) => {
    if (perfil === UserRole.CONSULTOR) handleNavigate('dashboard_consultor');
    else if (perfil === UserRole.COORDENADOR) handleNavigate('dashboard_coordenador');
    else if (perfil === UserRole.ADMIN) handleNavigate('admin_master');
  };

  const renderContent = () => {
    if (loadingProfile) {
      return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Identificando Usuário...</p>
        </div>
      );
    }

    if (!profile) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
          <div className="size-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">person_off</span>
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Perfil não encontrado</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">
              Seu login no Clerk foi bem-sucedido, mas não encontramos seu perfil no banco de dados do sistema.
              Por favor, solicite seu cadastro ao administrador.
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-6 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-all text-xs uppercase tracking-widest"
          >
            Sair e Tentar Outro E-mail
          </button>
        </div>
      );
    }

    switch (currentPage) {
      // Consultor Screens
      case 'dashboard_consultor':
        return <ConsultorDashboard onNavigate={handleNavigate} view="dashboard" profile={profile!} />;
      case 'solicitacoes':
        return <ConsultorDashboard onNavigate={handleNavigate} view="list" profile={profile!} />;
      case 'nova_solicitacao':
        return <NovaSolicitacao onBack={() => handleNavigate('dashboard_consultor')} profile={profile!} />;
      case 'visualizar_solicitacao':
        return <VisualizarSolicitacao onBack={() => handleNavigate('dashboard_consultor')} solicitationId={navigationParams?.solicitacaoId} />;

      // Coordenador Screens
      case 'dashboard_coordenador':
        return <CoordenadorDashboard onNavigate={handleNavigate} profile={profile!} />;
      case 'analise_coordenador':
        return <AnaliseCoordenador onBack={() => handleNavigate('dashboard_coordenador')} solicitationId={navigationParams?.solicitacaoId} profile={profile!} />;
      case 'historico':
        return <HistoricoCoordenador onNavigate={handleNavigate} profile={profile!} />;

      // Admin Screens
      case 'dashboard_admin':
        return <AdminDashboard onNavigate={handleNavigate} profile={profile!} />;
      case 'analise_diretor':
        return <AnaliseDiretor onBack={() => handleNavigate('dashboard_admin')} solicitationId={navigationParams?.solicitacaoId} profile={profile!} />;
      case 'admin_master':
        return <AdminCoringa onNavigate={handleNavigate} profile={profile!} />;
      case 'gerenciar_cursos':
        return <GerenciarCursos />;
      case 'gerenciar_usuarios':
        return <GerenciarUsuarios />;

      default:
        return <div className="p-20 text-center font-bold text-gray-400">Módulo em Desenvolvimento</div>;
    }
  };

  if (!isLoaded || (isSignedIn && loadingProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <Login />
      </SignedOut>
      <SignedIn>
        <Layout
          activeRole={profile?.perfil || UserRole.CONSULTOR}
          onNavigate={handleNavigate}
          currentPage={currentPage}
          userName={user?.fullName || profile?.nome}
          hideSearch={['analise_coordenador', 'analise_diretor', 'visualizar_solicitacao'].includes(currentPage)}
        >
          {renderContent()}
        </Layout>
      </SignedIn>
    </>
  );
};



export default App;

